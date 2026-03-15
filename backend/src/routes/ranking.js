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

// GET /api/ranking/history — últimos 7 dias
router.get('/history', async (req, res) => {
  const { data, error } = await supabase
    .from('daily_ranking')
    .select('round_date, user_id, username, balance, position, vs_duende')
    .order('round_date', { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

export default router;
