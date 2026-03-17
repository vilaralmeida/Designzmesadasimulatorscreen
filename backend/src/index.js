import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
}
import { logger } from './lib/logger.js';
import { startScheduler } from './services/scheduler.js';
import { fixturesRouter } from './routes/fixtures.js';
import { betsRouter } from './routes/bets.js';
import { bankrollRouter } from './routes/bankroll.js';
import { contentRouter } from './routes/content.js';
import { tipsRouter } from './routes/tips.js';
import { adminRouter } from './routes/admin.js';
import rankingRouter from './routes/ranking.js';
import { serieARouter } from './routes/serieA.js';

const app = express();

// ── Segurança ───────────────────────────────────────────────
app.use(helmet());
const ALLOWED_ORIGINS = [
  config.frontendUrl,
  'https://pindaiba.red',
  'https://www.pindaiba.red',
  'https://designzmesadasimulatorscreenvercel.vercel.app',
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origem não permitida'));
  },
  optionsSuccessStatus: 200,
}));
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
app.use('/api/ranking',  rankingRouter);
app.use('/api/serie-a', serieARouter);

// ── Rotas admin (protegidas) ────────────────────────────────
app.use('/admin', adminRouter);

// ── Sentry error handler (deve vir antes do handler genérico) ─
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

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
