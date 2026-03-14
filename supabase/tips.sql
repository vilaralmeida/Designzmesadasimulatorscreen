-- Rodar no Supabase Dashboard > SQL Editor
CREATE TABLE IF NOT EXISTS tips (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips (created_at DESC);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Inserir os dois comentários de exemplo iniciais
INSERT INTO tips (name, email, suggestion) VALUES
  ('Carlinhos da Bet', 'carlinhos@bet.com.br', 'Manda all-in no empate do Íbis! A odd tá 15.00, confia que é sucesso absoluto!'),
  ('João Sem Sorte',   'joao.loss@email.com',  'Esquece futebol, o negócio agora é apostar na corrida de galgos. O galgo 4 tá voando baixo.');
