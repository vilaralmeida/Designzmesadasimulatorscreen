import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const contentRouter = Router();

// GET /api/content — todos os blocos de conteúdo (público)
contentRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('key, value, type');

  if (error) return res.status(500).json({ error: error.message });

  // Retorna como objeto { key: value } para facilitar no frontend
  const result = Object.fromEntries(data.map(b => [b.key, { value: b.value, type: b.type }]));
  res.json(result);
});

// GET /api/content/:key — um bloco específico
contentRouter.get('/:key', async (req, res) => {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('key, value, type')
    .eq('key', req.params.key)
    .single();

  if (error) return res.status(404).json({ error: 'Conteúdo não encontrado.' });
  res.json(data);
});
