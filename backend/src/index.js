import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { startScheduler } from './services/scheduler.js';
import { fixturesRouter } from './routes/fixtures.js';
import { betsRouter } from './routes/bets.js';
import { bankrollRouter } from './routes/bankroll.js';
import { contentRouter } from './routes/content.js';
import { tipsRouter } from './routes/tips.js';
import { adminRouter } from './routes/admin.js';

const app = express();

// ── Segurança ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 60, message: { error: 'Muitas requisições. Tente em breve.' } }));

// ── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rotas públicas ──────────────────────────────────────────
app.use('/api/fixtures', fixturesRouter);
app.use('/api/bets',     betsRouter);
app.use('/api/bankroll', bankrollRouter);
app.use('/api/content',  contentRouter);
app.use('/api/tips',     tipsRouter);

// ── Rotas admin (protegidas) ────────────────────────────────
app.use('/admin', adminRouter);

// ── Erro genérico ────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('unhandled_error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(config.port, () => {
  logger.info('server_started', { port: config.port, env: process.env.NODE_ENV || 'development' });
  startScheduler();
});
