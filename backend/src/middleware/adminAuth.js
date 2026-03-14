import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  const ip = req.ip || req.connection.remoteAddress;

  if (!token || token !== config.adminSecret) {
    logger.warn('admin_login_failed', { ip });
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  logger.info('admin_login', { ip });
  next();
}
