import { Router } from 'express';
import { fetchRounds, fetchFixturesByRound } from '../services/apiFootball.js';

export const serieARouter = Router();

const LEAGUE_ID = 71;

function getCurrentSeason() {
  return new Date().getFullYear();
}

// Cache em memória simples
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// GET /api/serie-a/rounds — lista todas as rodadas da temporada atual
serieARouter.get('/rounds', async (req, res) => {
  const season = getCurrentSeason();
  const cacheKey = `rounds_${season}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const rounds = await fetchRounds(LEAGUE_ID, season);
    setCached(cacheKey, rounds);
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/serie-a/rounds/:round — jogos de uma rodada específica
// Ex: /api/serie-a/rounds/Regular Season - 1
serieARouter.get('/rounds/:round', async (req, res) => {
  const season = getCurrentSeason();
  const round = decodeURIComponent(req.params.round);
  const cacheKey = `round_${season}_${round}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const fixtures = await fetchFixturesByRound(LEAGUE_ID, season, round);
    // Rodadas finalizadas podem ter TTL longo; rodadas futuras usam TTL padrão
    setCached(cacheKey, fixtures);
    res.json(fixtures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
