import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { getQuotaStatus } from '../services/apiFootball.js';

export const fixturesRouter = Router();

// GET /api/fixtures/upcoming — apostas pendentes para exibir no app
fixturesRouter.get('/upcoming', async (req, res) => {
  const { data, error } = await supabase
    .from('upcoming_bets')
    .select('*')
    .eq('status', 'pending')
    .order('match_date', { ascending: true })
    .limit(5);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/fixtures/quota — status da quota da API (útil para debug)
fixturesRouter.get('/quota', (req, res) => {
  res.json(getQuotaStatus());
});
