import { supabase } from '../lib/supabase.js';
import { fetchUpcomingFixtures, fetchOdds } from './apiFootball.js';
import { logger } from '../lib/logger.js';

// ── Pool de ligas (ordenadas por prioridade) ─────────────────
const PRIORITY_LEAGUES = [
  // Brasil
  { id: 71,  name: 'Brasileirão Série A', country: 'Brazil'      },
  { id: 72,  name: 'Brasileirão Série B', country: 'Brazil'      },
  { id: 75,  name: 'Brasileirão Série C', country: 'Brazil'      },
  { id: 73,  name: 'Copa do Brasil',      country: 'Brazil'      },
  // Europa — top 5
  { id: 39,  name: 'Premier League',      country: 'England'     },
  { id: 140, name: 'La Liga',             country: 'Spain'       },
  { id: 135, name: 'Serie A',             country: 'Italy'       },
  { id: 78,  name: 'Bundesliga',          country: 'Germany'     },
  { id: 61,  name: 'Ligue 1',             country: 'France'      },
  { id: 94,  name: 'Primeira Liga',       country: 'Portugal'    },
  // Europa — competições internacionais
  { id: 2,   name: 'Champions League',    country: 'Europe'      },
  { id: 3,   name: 'Europa League',       country: 'Europe'      },
  { id: 848, name: 'Conference League',   country: 'Europe'      },
  // Europa — outras ligas
  { id: 88,  name: 'Eredivisie',          country: 'Netherlands' },
  { id: 144, name: 'Belgian Pro League',  country: 'Belgium'     },
  { id: 179, name: 'Scottish Prem.',      country: 'Scotland'    },
  { id: 203, name: 'Süper Lig',           country: 'Turkey'      },
  { id: 197, name: 'Super League',        country: 'Greece'      },
  // Américas
  { id: 253, name: 'MLS',                 country: 'USA'         },
  { id: 262, name: 'Liga MX',             country: 'Mexico'      },
  { id: 128, name: 'Primera División',    country: 'Argentina'   },
  { id: 239, name: 'Primera División',    country: 'Chile'       },
  { id: 218, name: 'Serie A',             country: 'Colombia'    },
  // Ásia / Oriente Médio
  { id: 98,  name: 'J-League',            country: 'Japan'       },
  { id: 292, name: 'K-League',            country: 'South Korea' },
  { id: 307, name: 'Saudi Pro League',    country: 'Saudi Arabia'},
  // África
  { id: 233, name: 'Premier League',      country: 'Egypt'       },
];

// Mantido por compatibilidade com ensureContinuousBet
const FALLBACK_LEAGUES = PRIORITY_LEAGUES.slice(10);

// ── Frases do Duende Chicão ─────────────────────────────────
const DUENDE_QUOTES = [
  // Confiança inabalável
  'É CERTO, pai! Pode apostar!',
  'Confia no Chicão! Dessa vez é diferente!',
  'Barbada total! Já tô contando o dinheiro!',
  'Mete tudo, Zé! É pra hoje!',
  'Tô sentindo no ar... é green garantido!',
  'Nunca errei nessa. Nas outras sim, mas nessa não!',
  'Isso aqui é certeza absoluta... quase.',

  // Análise duvidosa
  'Vi num sonho, Zé. Confia no processo!',
  'A odd tá boa, manda ver!',
  'Analisei tudo: forma, clima, horóscopo. É nós!',
  'Coloquei no papel, fiz as contas, é matemática pura!',
  'Esse time é favorito do universo. Vai na fé!',
  'Qualquer resultado que não for esse, o árbitro é culpado.',
  'Assisti o último jogo deles de olho fechado. Confio muito.',
  'O técnico me mandou mensagem no sonho dizendo que vão ganhar.',
  'Fiz uma análise profunda de 30 segundos. Tá confirmado.',
  'Minha vizinha que entende de futebol disse que é esse. Tamo dentro.',
  'Consultei o tarô, o baralho e o bispo. Unânime: é esse!',
  'A estatística não mente... quando eu entendo ela.',

  // Culpa nos outros
  'Se perder, é culpa da altitude. Não tem como errar.',
  'Se der errado, a culpa é do gramado.',
  'Esse resultado só não acontece se o goleiro tiver com fome.',
  'A única forma de perder é se chover. E tá sol.',
  'Só perde se o VAR entrar em colapso existencial.',

  // Filosófico sem necessidade
  'No futebol, quem não arrisca não petisca. Ou some o troco.',
  'A vida é incerta. Mas essa aposta não.',
  'Perder faz parte. Mas ganhar faz mais.',
  'Zé, o dinheiro vai e volta. A fé fica.',
  'Uma derrota não define um homem. Mas define o saldo.',

  // Autoconfiança questionável
  'Meu histórico tá um pouco manchado, mas esse é diferente.',
  'Errei nas últimas sete, mas a oitava é especial, sinto no fígado.',
  'Tô numa seca de acertos, mas estatisticamente, a hora chegou.',
  'Não sou especialista, mas vejo coisas que especialista não vê.',
  'Zé, já errei tanto que o acerto tá chegando. Lei dos grandes números.',

  // Completamente sem sentido
  'Sonhei com uma galinha laranja. Sinal claro: é esse aí.',
  'O lateral-direito deles nasceu em ano bissexto. Nós ganhamos.',
  'Vi uma cotia atravessando a rua perto do estádio. Ótimo presságio.',
  'O número da camisa do artilheiro somado com o CEP do estádio dá 7. Sorte máxima.',
  'Abri a Bíblia no aleatório e caiu em Vitória. Literalmente.',
  'Meu gato olhou fixo pro celular quando mostrei esse jogo. Ele sabe.',
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
export async function generateDailyBets({ daysAhead = 14, leagues = PRIORITY_LEAGUES, maxBets = 8 } = {}) {
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

    // Liquidar user_bets para este jogo
    await settleUserBets(bet.id, actualResult);

    logger.info('bet_settled', {
      match: `${bet.home_team} x ${bet.away_team}`,
      result,
      score: `${homeScore}-${awayScore}`,
      payout,
      new_balance: newBalance,
    });
  }

  // Gerar snapshot do ranking após liquidar todas as apostas
  await generateDailyRanking();
}

/**
 * Liquida os palpites dos usuários para um jogo finalizado.
 */
async function settleUserBets(upcomingBetId, actualResult) {
  const { data: userBets } = await supabase
    .from('user_bets')
    .select('*')
    .eq('upcoming_bet_id', upcomingBetId)
    .is('result', null);

  if (!userBets?.length) return;

  for (const ub of userBets) {
    const won = ub.bet_type === actualResult;
    const payout = won ? +(ub.amount * ub.odds).toFixed(2) : 0;
    const result = won ? 'win' : 'loss';
    const delta = won ? payout - ub.amount : -ub.amount;

    // Atualizar resultado da aposta
    await supabase.from('user_bets')
      .update({ result, payout })
      .eq('id', ub.id);

    // Atualizar saldo do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('balance')
      .eq('id', ub.user_id)
      .single();

    if (profile) {
      const newBalance = Math.max(0, +(profile.balance + delta).toFixed(2));
      // Bônus se zerar
      const finalBalance = newBalance === 0 ? 10 : newBalance;
      await supabase.from('user_profiles')
        .update({ balance: finalBalance })
        .eq('id', ub.user_id);
    }
  }
}

/**
 * Gera snapshot diário do ranking com todos os usuários + Duende.
 */
async function generateDailyRanking() {
  const today = new Date().toISOString().slice(0, 10);

  // Saldo do Duende (bankroll atual)
  const { data: bankroll } = await supabase
    .from('bankroll')
    .select('balance')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  const duendeBalance = bankroll?.balance ?? 100;

  // Buscar todos os perfis
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, username, avatar_url, balance');

  if (!profiles?.length && duendeBalance === 100) return;

  // Calcular P&L do dia por usuário
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const entries = [];

  // Duende
  const { data: duendeBets } = await supabase
    .from('bets')
    .select('amount, payout, result')
    .gte('match_date', startOfDay.toISOString());

  const duendePnl = (duendeBets ?? []).reduce((acc, b) => {
    return acc + (b.result === 'win' ? b.payout - b.amount : -b.amount);
  }, 0);

  entries.push({
    round_date: today,
    user_id: null,
    username: 'Duende Chicão',
    avatar_url: null,
    balance: duendeBalance,
    daily_pnl: +duendePnl.toFixed(2),
    position: 0,
    vs_duende: 'equal',
  });

  // Usuários
  for (const p of profiles ?? []) {
    const { data: userBetsToday } = await supabase
      .from('user_bets')
      .select('amount, payout, result')
      .eq('user_id', p.id)
      .not('result', 'is', null)
      .gte('created_at', startOfDay.toISOString());

    const pnl = (userBetsToday ?? []).reduce((acc, b) => {
      return acc + (b.result === 'win' ? b.payout - b.amount : -b.amount);
    }, 0);

    entries.push({
      round_date: today,
      user_id: p.id,
      username: p.username,
      avatar_url: p.avatar_url,
      balance: p.balance,
      daily_pnl: +pnl.toFixed(2),
      position: 0,
      vs_duende: p.balance > duendeBalance ? 'above' : p.balance < duendeBalance ? 'below' : 'equal',
    });
  }

  // Ordenar por saldo e atribuir posição
  entries.sort((a, b) => b.balance - a.balance);
  entries.forEach((e, i) => { e.position = i + 1; });

  // Upsert no daily_ranking
  await supabase.from('daily_ranking')
    .upsert(entries, { onConflict: 'round_date,user_id' });

  logger.info('ranking_generated', { date: today, participants: entries.length });
}
