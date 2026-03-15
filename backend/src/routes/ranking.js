import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// GET /api/ranking?date=2026-03-15
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_ranking')
    .select('*')
    .eq('round_date', date)
    .order('position', { ascending: true })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

// GET /api/ranking/history?days=30
router.get('/history', async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 90);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_ranking')
    .select('round_date, user_id, username, avatar_url, balance, daily_pnl, position, vs_duende')
    .gte('round_date', sinceStr)
    .order('round_date', { ascending: false })
    .order('position', { ascending: true })
    .limit(500);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

export default router;
