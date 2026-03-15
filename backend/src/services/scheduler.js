import cron from 'node-cron';
import { generateDailyBets, settlePendingBets, ensureContinuousBet } from './betEngine.js';
import { logger } from '../lib/logger.js';

/**
 * Orçamento de chamadas à API — Plano Basic (100/dia):
 *
 * 08:00 — Gerar apostas do dia
 *   - 1 chamada por liga × 5 ligas = 5 chamadas (fixtures)
 *   - 1 chamada por aposta × 3 apostas = 3 chamadas (odds)
 *   Subtotal: ~8 chamadas
 *
 * 12:00, 18:00, 23:30 — Verificar resultados
 *   - 1 chamada por aposta pendente × máx 5 = 5 × 3 rodadas = 15 chamadas
 *   Subtotal: ~15 chamadas
 *
 * 14:00 — Garantir aposta contínua (só chama API se upcoming_bets estiver vazio)
 *   - Caso normal (já há apostas): 0 chamadas
 *   - Caso vazio: até 5 ligas prioritárias + 5 fallback = ~10 chamadas (raro)
 *   Subtotal: ~0–10 chamadas
 *
 * Total estimado: ~23 chamadas/dia normais, ~33 em dias sem jogos
 */

async function runJob(name, fn) {
  const start = Date.now();
  logger.info('scheduler_run', { job: name, phase: 'start' });
  try {
    await fn();
    logger.info('scheduler_run', { job: name, phase: 'done', duration_ms: Date.now() - start });
  } catch (err) {
    logger.error('scheduler_error', { job: name, message: err.message, duration_ms: Date.now() - start });
  }
}

export function startScheduler() {
  // 08:00 — Gerar apostas do dia
  cron.schedule('0 8 * * *', () => runJob('generate_daily_bets', generateDailyBets), {
    timezone: 'America/Sao_Paulo',
  });

  // 14:00 — Garantir que sempre há pelo menos 1 aposta pendente
  cron.schedule('0 14 * * *', () => runJob('ensure_continuous_bet', ensureContinuousBet), {
    timezone: 'America/Sao_Paulo',
  });

  // 12:00, 18:00, 23:30 — Verificar resultados
  ['0 12 * * *', '0 18 * * *', '30 23 * * *'].forEach(expression => {
    cron.schedule(expression, () => runJob('settle_pending_bets', settlePendingBets), {
      timezone: 'America/Sao_Paulo',
    });
  });

  logger.info('scheduler_started', {
    jobs: [
      'generate_daily_bets @ 08:00 BRT',
      'ensure_continuous_bet @ 14:00 BRT',
      'settle_pending_bets @ 12:00, 18:00, 23:30 BRT',
    ],
  });
}
