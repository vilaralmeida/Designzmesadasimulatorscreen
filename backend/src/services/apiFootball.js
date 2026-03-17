import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { supabase } from '../lib/supabase.js';

// ── Contador de quota diária ────────────────────────────────
let dailyCallCount = 0;
let lastResetDate = new Date().toDateString();

function checkQuota() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyCallCount = 0;
    lastResetDate = today;
  }
  if (dailyCallCount >= config.apiFootball.safeLimit) {
    throw new Error(`Quota diária atingida: ${dailyCallCount}/${config.apiFootball.dailyLimit} chamadas usadas hoje.`);
  }
  dailyCallCount++;
}

export function getQuotaStatus() {
  return { used: dailyCallCount, limit: config.apiFootball.safeLimit, safe: dailyCallCount < config.apiFootball.safeLimit };
}

// ── Cliente HTTP ────────────────────────────────────────────
const client = axios.create({
  baseURL: config.apiFootball.baseUrl,
  headers: { 'x-apisports-key': config.apiFootball.key },
  timeout: 10000,
});

async function get(endpoint, params = {}) {
  checkQuota();
  const start = Date.now();
  try {
    const { data } = await client.get(endpoint, { params });
    const latency = Date.now() - start;
    logger.info('api_call', { endpoint, params, status: 200, latency_ms: latency, quota_used: dailyCallCount });
    return data;
  } catch (err) {
    const latency = Date.now() - start;
    const status = err.response?.status;
    logger.error('api_error', { endpoint, params, status, message: err.message, latency_ms: latency });
    throw err;
  }
}

// ── Helpers de temporada ────────────────────────────────────
const BRAZIL_LEAGUES = [71, 72, 73, 75];

function getCurrentSeason(leagueId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (BRAZIL_LEAGUES.includes(leagueId)) return year;
  // Ligas europeias: temporada começa em agosto
  return month >= 8 ? year : year - 1;
}

// ── Endpoints públicos ──────────────────────────────────────

/**
 * Busca jogos dos próximos N dias de uma liga.
 * Usa from/to em vez de next= (mais compatível com plano free).
 */
export async function fetchUpcomingFixtures(leagueId, daysAhead = 7) {
  const season = getCurrentSeason(leagueId);
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + daysAhead);

  const fmt = d => d.toISOString().split('T')[0]; // YYYY-MM-DD

  const data = await get('/fixtures', {
    league: leagueId,
    season,
    from: fmt(from),
    to:   fmt(to),
  });
  return data.response || [];
}

/**
 * Busca resultado de um jogo específico pelo ID.
 */
export async function fetchFixtureResult(fixtureId) {
  const data = await get('/fixtures', { id: fixtureId });
  return data.response?.[0] || null;
}

/**
 * Lista todas as rodadas de uma liga/temporada.
 * Ex: ['Regular Season - 1', 'Regular Season - 2', ...]
 */
export async function fetchRounds(leagueId, season) {
  const data = await get('/fixtures/rounds', { league: leagueId, season });
  return data.response || [];
}

/**
 * Busca todos os jogos de uma rodada específica.
 */
export async function fetchFixturesByRound(leagueId, season, round) {
  const data = await get('/fixtures', { league: leagueId, season, round });
  return data.response || [];
}

/**
 * Busca odds pré-jogo de um fixture (bookmaker: 8 = Bet365).
 * Retorna null se o endpoint não estiver disponível no plano atual.
 */
export async function fetchOdds(fixtureId) {
  try {
    const data = await get('/odds', { fixture: fixtureId, bookmaker: 8 });
    const bookmaker = data.response?.[0]?.bookmakers?.[0];
    if (!bookmaker) return null;
    const market = bookmaker.bets?.find(b => b.name === 'Match Winner');
    if (!market) return null;
    return {
      home: parseFloat(market.values.find(v => v.value === 'Home')?.odd || '0'),
      draw: parseFloat(market.values.find(v => v.value === 'Draw')?.odd || '0'),
      away: parseFloat(market.values.find(v => v.value === 'Away')?.odd || '0'),
    };
  } catch {
    // Odds endpoint pode não estar disponível no plano free
    return null;
  }
}
