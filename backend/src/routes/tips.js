import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const tipsRouter = Router();

// Mascara email para exibição pública: "ca******@bet.com.br"
function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`;
}

// GET /api/tips
tipsRouter.get('/', async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const { data, error, count } = await supabase
    .from('tips')
    .select('id, name, email, suggestion, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  const safe = data.map(t => ({
    ...t,
    email: maskEmail(t.email),
  }));

  res.json({ data: safe, total: count, limit, offset });
});

// POST /api/tips
tipsRouter.post('/', async (req, res) => {
  const { name, email, suggestion } = req.body;

  if (!name?.trim() || !email?.trim() || !suggestion?.trim()) {
    return res.status(400).json({ error: 'name, email e suggestion são obrigatórios.' });
  }

  // Validação básica de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido.' });
  }

  // Limitar tamanho
  if (suggestion.trim().length > 500) {
    return res.status(400).json({ error: 'Sugestão muito longa (máx 500 caracteres).' });
  }

  const { data, error } = await supabase
    .from('tips')
    .insert({ name: name.trim(), email: email.trim().toLowerCase(), suggestion: suggestion.trim() })
    .select('id, name, email, suggestion, created_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  logger.info('tip_submitted', { name: name.trim() });

  res.status(201).json({ ...data, email: maskEmail(data.email) });
});
