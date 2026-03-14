import cron from 'node-cron';
import { generateDailyBets, settlePendingBets } from './betEngine.js';
import { logger } from '../lib/logger.js';

/**
 * Orçamento de chamadas à API — Plano Free (100/dia):
 *
 * 08:00 — Gerar apostas do dia
 *   - 1 chamada por liga × 3 ligas = 3 chamadas (fixtures)
 *   - 1 chamada por aposta × 3 apostas = 3 chamadas (odds)
 *   Subtotal: ~6 chamadas
 *
 * 12:00, 18:00, 23:30 — Verificar resultados
 *   - 1 chamada por aposta pendente × máx 5 = 5 chamadas × 3 rodadas = 15
 *   Subtotal: ~15 chamadas
 *
 * Total estimado: ~21 chamadas/dia (margem de segurança enorme)
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
  // 08:00 — Gerar apostas do dia (horário de Brasília UTC-3 = 11:00 UTC)
  cron.schedule('0 11 * * *', () => runJob('generate_daily_bets', generateDailyBets), {
    timezone: 'America/Sao_Paulo',
  });

  // 12:00, 18:00, 23:30 — Verificar resultados
  ['0 12 * * *', '0 18 * * *', '30 23 * * *'].forEach(expression => {
    cron.schedule(expression, () => runJob('settle_pending_bets', settlePendingBets), {
      timezone: 'America/Sao_Paulo',
    });
  });

  logger.info('scheduler_started', {
    jobs: ['generate_daily_bets @ 08:00 BRT', 'settle_pending_bets @ 12:00, 18:00, 23:30 BRT'],
  });
}
