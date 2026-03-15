import { supabase } from '../lib/supabase.js';
import { fetchUpcomingFixtures, fetchOdds } from './apiFootball.js';
import { logger } from '../lib/logger.js';

// ── Ligas prioritárias ──────────────────────────────────────
const PRIORITY_LEAGUES = [
  { id: 71,  name: 'Brasileirão Série A', country: 'Brazil'   },
  { id: 39,  name: 'Premier League',      country: 'England'  },
  { id: 140, name: 'La Liga',             country: 'Spain'    },
  { id: 135, name: 'Serie A',             country: 'Italy'    },
  { id: 94,  name: 'Primeira Liga',       country: 'Portugal' },
];

// ── Ligas de fallback (ativadas só quando não há jogos nas prioritárias) ──
const FALLBACK_LEAGUES = [
  { id: 2,   name: 'Champions League',   country: 'Europe'   },
  { id: 61,  name: 'Ligue 1',            country: 'France'   },
  { id: 88,  name: 'Eredivisie',         country: 'Netherlands' },
  { id: 253, name: 'MLS',                country: 'USA'      },
  { id: 262, name: 'Liga MX',            country: 'Mexico'   },
];

// ── Frases do Duende Chicão ─────────────────────────────────
const DUENDE_QUOTES = [
  'É CERTO, pai! Pode apostar!',
  'Vi num sonho, Zé. Confia no processo!',
  'A odd tá boa, manda ver!',
  'Isso aqui é certeza absoluta... quase.',
  'Nunca errei nessa. Nas outras sim, mas nessa não!',
  'Mete tudo, Zé! É pra hoje!',
  'Analisei tudo: forma, clima, horóscopo. É nós!',
  'Confia no Chicão! Dessa vez é diferente!',
  'Barbada total! Já tô contando o dinheiro!',
  'Esse time é favorito do universo. Vai na fé!',
  'Tô sentindo no ar... é green garantido!',
  'Qualquer resultado que não for esse, o árbitro é culpado.',
  'Coloquei no papel, fiz as contas, é matemática pura!',
];

// ── Odds simuladas quando API não retorna ───────────────────
function simulateOdds() {
  const home = +(1.5 + Math.random() * 2.0).toFixed(2);
  const draw = +(2.8 + Math.random() * 1.2).toFixed(2);
  const away = +(1.8 + Math.random() * 2.5).toFixed(2);
  return { home, draw, away };
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetAmount() {
  return Math.floor(Math.random() * 10) + 1; // R$1 a R$10
}

// ── Lógica principal ────────────────────────────────────────

/**
 * Gera apostas aleatórias para os próximos jogos.
 * @param {object} opts
 * @param {number} opts.daysAhead - Janela de busca em dias (padrão: 5)
 * @param {Array}  opts.leagues   - Lista de ligas a usar (padrão: PRIORITY_LEAGUES)
 */
export async function generateDailyBets({ daysAhead = 7, leagues = PRIORITY_LEAGUES, maxBets = 5 } = {}) {
  const MAX_NEW_BETS = maxBets;
  logger.info('bet_engine_start', { max_bets: MAX_NEW_BETS, days_ahead: daysAhead, leagues: leagues.length });

  // Pegar IDs de jogos que já têm aposta pendente para não duplicar
  const { data: existing } = await supabase
    .from('upcoming_bets')
    .select('match_id')
    .eq('status', 'pending');

  const existingIds = new Set((existing || []).map(b => b.match_id));

  const newBets = [];

  for (const league of leagues) {
    if (newBets.length >= MAX_NEW_BETS) break;

    let fixtures = [];
    try {
      fixtures = await fetchUpcomingFixtures(league.id, daysAhead);
    } catch (err) {
      logger.error('fixture_fetch_failed', { league: league.name, message: err.message });
      continue;
    }

    // Filtrar jogos que ainda não têm aposta e são no futuro
    const now = new Date();
    const available = fixtures.filter(f => {
      const id = String(f.fixture.id);
      const date = new Date(f.fixture.date);
      return !existingIds.has(id) && date > now;
    });

    if (available.length === 0) continue;

    // Sortear 1 jogo desta liga
    const fixture = randomItem(available);
    const fixtureId = String(fixture.fixture.id);

    // Tentar pegar odds reais; se não, simular
    let odds = null;
    try {
      odds = await fetchOdds(fixtureId);
    } catch {
      // ignora
    }
    if (!odds || odds.home === 0) odds = simulateOdds();

    // Sortear palpite e valor
    const betType = randomItem(['home', 'draw', 'away']);
    const amount = randomBetAmount();
    const selectedOdd = odds[betType];

    const bet = {
      match_id:      fixtureId,
      home_team:     fixture.teams.home.name,
      away_team:     fixture.teams.away.name,
      home_logo:     fixture.teams.home.logo,
      away_logo:     fixture.teams.away.logo,
      league:        league.name,
      league_logo:   fixture.league.logo,
      league_country: league.country,
      match_date:    fixture.fixture.date,
      bet_type:      betType,
      odds:          selectedOdd,
      amount,
      duende_quote:  randomItem(DUENDE_QUOTES),
      status:        'pending',
    };

    newBets.push(bet);
    existingIds.add(fixtureId);
    logger.info('bet_generated', { match: `${bet.home_team} x ${bet.away_team}`, bet_type: betType, odds: selectedOdd, amount });
  }

  if (newBets.length === 0) {
    logger.info('bet_engine_no_bets', { reason: 'Nenhum jogo novo disponível' });
    return [];
  }

  const { error } = await supabase.from('upcoming_bets').insert(newBets);
  if (error) {
    logger.error('bet_insert_failed', { message: error.message });
    throw error;
  }

  logger.info('bet_engine_done', { bets_generated: newBets.length });
  return newBets;
}

/**
 * Garante que sempre haja pelo menos 1 aposta pendente.
 * Chamado pelo scheduler às 14h se upcoming_bets estiver vazio.
 * Tenta ligas prioritárias com janela ampliada (14 dias),
 * depois ligas de fallback se ainda não encontrar jogos.
 */
export async function ensureContinuousBet() {
  const { data: pending } = await supabase
    .from('upcoming_bets')
    .select('id')
    .eq('status', 'pending')
    .limit(1);

  if (pending?.length > 0) {
    logger.info('ensure_bet_ok', { reason: 'Já há aposta pendente' });
    return;
  }

  logger.info('ensure_bet_empty', { reason: 'Sem apostas pendentes — tentando gerar com janela ampliada' });

  // Tentativa 1: ligas prioritárias com 14 dias
  let bets = await generateDailyBets({ daysAhead: 14, leagues: PRIORITY_LEAGUES });

  if (bets.length === 0) {
    logger.warn('ensure_bet_fallback', { reason: 'Ligas prioritárias vazias — tentando ligas de fallback' });
    // Tentativa 2: ligas de fallback com 14 dias
    bets = await generateDailyBets({ daysAhead: 14, leagues: FALLBACK_LEAGUES });
  }

  if (bets.length === 0) {
    logger.warn('ensure_bet_none', { reason: 'Nenhum jogo encontrado em nenhuma liga — aguardando próximo ciclo' });
  } else {
    logger.info('ensure_bet_done', { bets_generated: bets.length });
  }
}

/**
 * Verifica resultados de apostas pendentes cujo jogo já terminou.
 * Chamado pelo scheduler 3x/dia.
 */
export async function settlePendingBets() {
  const { fetchFixtureResult } = await import('./apiFootball.js');

  const { data: pending, error } = await supabase
    .from('upcoming_bets')
    .select('*')
    .eq('status', 'pending')
    .lt('match_date', new Date().toISOString());

  if (error || !pending?.length) {
    logger.info('settle_no_pending', { count: 0 });
    return;
  }

  logger.info('settle_start', { pending_count: pending.length });

  for (const bet of pending) {
    let fixture;
    try {
      fixture = await fetchFixtureResult(bet.match_id);
    } catch (err) {
      logger.error('settle_fetch_failed', { match_id: bet.match_id, message: err.message });
      continue;
    }

    if (!fixture) continue;

    const status = fixture.fixture.status.short;
    // Só liquidar se o jogo realmente terminou
    if (!['FT', 'AET', 'PEN'].includes(status)) continue;

    const homeScore = fixture.goals.home;
    const awayScore = fixture.goals.away;

    let actualResult;
    if (homeScore > awayScore)      actualResult = 'home';
    else if (homeScore < awayScore) actualResult = 'away';
    else                            actualResult = 'draw';

    const won = actualResult === bet.bet_type;
    const payout = won ? +(bet.amount * bet.odds).toFixed(2) : 0;
    const result = won ? 'win' : 'loss';

    // Registrar na tabela de histórico
    await supabase.from('bets').insert({
      match_id:      bet.match_id,
      home_team:     bet.home_team,
      away_team:     bet.away_team,
      home_logo:     bet.home_logo,
      away_logo:     bet.away_logo,
      league:        bet.league,
      league_logo:   bet.league_logo,
      league_country: bet.league_country,
      match_date:    bet.match_date,
      bet_type:      bet.bet_type,
      odds:          bet.odds,
      amount:        bet.amount,
      result,
      payout,
      home_score:    homeScore,
      away_score:    awayScore,
      duende_quote:  bet.duende_quote,
    });

    // Atualizar bankroll
    const { data: bankroll } = await supabase
      .from('bankroll')
      .select('balance')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const currentBalance = bankroll?.balance || 0;
    const delta = won ? payout - bet.amount : -bet.amount;
    const newBalance = +(currentBalance + delta).toFixed(2);

    await supabase
      .from('bankroll')
      .update({ balance: newBalance, updated_at: new Date().toISOString(), updated_by: 'scheduler' })
      .eq('id', bankroll.id);

    // Marcar aposta como liquidada
    await supabase
      .from('upcoming_bets')
      .update({ status: 'settled' })
      .eq('id', bet.id);

    logger.info('bet_settled', {
      match: `${bet.home_team} x ${bet.away_team}`,
      result,
      score: `${homeScore}-${awayScore}`,
      payout,
      new_balance: newBalance,
    });
  }
}
