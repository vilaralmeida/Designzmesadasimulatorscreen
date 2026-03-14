import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { logger } from '../lib/logger.js';
import { generateDailyBets, settlePendingBets } from '../services/betEngine.js';
import { getQuotaStatus } from '../services/apiFootball.js';

export const adminRouter = Router();

// Todas as rotas admin exigem autenticação
adminRouter.use(adminAuth);

// ── Bankroll ────────────────────────────────────────────────

// POST /admin/bankroll/set — definir saldo exato
adminRouter.post('/bankroll/set', async (req, res) => {
  const { balance } = req.body;
  if (typeof balance !== 'number' || balance < 0) {
    return res.status(400).json({ error: 'Saldo inválido.' });
  }

  const { data: current } = await supabase
    .from('bankroll').select('id, balance').order('updated_at', { ascending: false }).limit(1).single();

  const { error } = await supabase
    .from('bankroll')
    .update({ balance: +balance.toFixed(2), updated_at: new Date().toISOString(), updated_by: 'admin' })
    .eq('id', current.id);

  if (error) return res.status(500).json({ error: error.message });

  logger.info('balance_updated', { old: current.balance, new: balance, admin: 'admin' });
  res.json({ ok: true, balance });
});

// POST /admin/bankroll/add — adicionar valor
adminRouter.post('/bankroll/add', async (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== 'number') return res.status(400).json({ error: 'Valor inválido.' });

  const { data: current } = await supabase
    .from('bankroll').select('id, balance').order('updated_at', { ascending: false }).limit(1).single();

  const newBalance = +(parseFloat(current.balance) + amount).toFixed(2);

  const { error } = await supabase
    .from('bankroll')
    .update({ balance: newBalance, updated_at: new Date().toISOString(), updated_by: 'admin' })
    .eq('id', current.id);

  if (error) return res.status(500).json({ error: error.message });

  logger.info('balance_updated', { old: current.balance, new: newBalance, delta: amount, admin: 'admin' });
  res.json({ ok: true, balance: newBalance });
});

// ── Conteúdo ────────────────────────────────────────────────

// GET /admin/content — listar todos
adminRouter.get('/content', async (req, res) => {
  const { data, error } = await supabase.from('content_blocks').select('*').order('key');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /admin/content/:key — editar bloco
adminRouter.put('/content/:key', async (req, res) => {
  const { value } = req.body;
  if (!value && value !== '') return res.status(400).json({ error: 'value é obrigatório.' });

  const { error } = await supabase
    .from('content_blocks')
    .update({ value, updated_at: new Date().toISOString(), updated_by: 'admin' })
    .eq('key', req.params.key);

  if (error) return res.status(500).json({ error: error.message });

  logger.info('content_updated', { key: req.params.key, admin: 'admin' });
  res.json({ ok: true });
});

// ── Apostas ─────────────────────────────────────────────────

// GET /admin/upcoming-bets
adminRouter.get('/upcoming-bets', async (req, res) => {
  const { data, error } = await supabase
    .from('upcoming_bets').select('*').order('match_date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /admin/bets/generate — forçar geração de novas apostas
adminRouter.post('/bets/generate', async (req, res) => {
  try {
    const bets = await generateDailyBets();
    res.json({ ok: true, generated: bets.length, bets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/bets/settle — forçar liquidação de apostas pendentes
adminRouter.post('/bets/settle', async (req, res) => {
  try {
    await settlePendingBets();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/bets/:id/cancel — cancelar aposta específica
adminRouter.post('/bets/:id/cancel', async (req, res) => {
  const { error } = await supabase
    .from('upcoming_bets')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Logs ────────────────────────────────────────────────────

// GET /admin/logs
adminRouter.get('/logs', async (req, res) => {
  const level  = req.query.level;
  const limit  = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  let query = supabase
    .from('system_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (level) query = query.eq('level', level);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, total: count, limit, offset });
});

// ── Quota API ────────────────────────────────────────────────

// GET /admin/quota
adminRouter.get('/quota', (req, res) => {
  res.json(getQuotaStatus());
});
