import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const betsRouter = Router();

// GET /api/bets — histórico de apostas liquidadas
betsRouter.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const { data, error, count } = await supabase
    .from('bets')
    .select('*', { count: 'exact' })
    .order('match_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, total: count, limit, offset });
});

// GET /api/bets/stats — estatísticas gerais
betsRouter.get('/stats', async (req, res) => {
  const { data, error } = await supabase
    .from('bets')
    .select('result, amount, payout, odds');

  if (error) return res.status(500).json({ error: error.message });

  const total   = data.length;
  const wins    = data.filter(b => b.result === 'win').length;
  const losses  = data.filter(b => b.result === 'loss').length;
  const wagered = data.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const returned = data.reduce((sum, b) => sum + parseFloat(b.payout || 0), 0);
  const roi     = wagered > 0 ? +((returned - wagered) / wagered * 100).toFixed(2) : 0;

  res.json({
    total,
    wins,
    losses,
    winRate: total > 0 ? +((wins / total) * 100).toFixed(1) : 0,
    wagered: +wagered.toFixed(2),
    returned: +returned.toFixed(2),
    roi,
  });
});
