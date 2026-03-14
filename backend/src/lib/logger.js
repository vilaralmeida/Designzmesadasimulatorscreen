import winston from 'winston';
import { supabase } from './supabase.js';

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, event, ...rest }) => {
          const extras = Object.keys(rest).length ? JSON.stringify(rest) : '';
          return `[${timestamp}] ${level}: ${event || ''} ${extras}`;
        })
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

async function saveToSupabase(level, event, payload) {
  try {
    await supabase.from('system_logs').insert({ level, event, payload });
  } catch {
    // falha silenciosa — não quebrar o servidor por falha de log
  }
}

export const logger = {
  info(event, payload) {
    winstonLogger.info({ event, ...payload });
    saveToSupabase('info', event, payload);
  },
  warn(event, payload) {
    winstonLogger.warn({ event, ...payload });
    saveToSupabase('warn', event, payload);
  },
  error(event, payload) {
    winstonLogger.error({ event, ...payload });
    saveToSupabase('error', event, payload);
  },
};
