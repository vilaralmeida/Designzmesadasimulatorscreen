import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const bankrollRouter = Router();

// GET /api/bankroll — saldo atual
bankrollRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('bankroll')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/bankroll/history — evolução do saldo com base nas apostas
bankrollRouter.get('/history', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('bets')
    .select('match_date, result, amount, payout')
    .gte('match_date', since.toISOString())
    .order('match_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Calcular saldo acumulado dia a dia
  let running = 0;
  const history = data.map(bet => {
    const delta = bet.result === 'win'
      ? parseFloat(bet.payout) - parseFloat(bet.amount)
      : -parseFloat(bet.amount);
    running = +(running + delta).toFixed(2);
    return {
      date: bet.match_date,
      delta: +delta.toFixed(2),
      balance: running,
      result: bet.result,
    };
  });

  res.json(history);
});
