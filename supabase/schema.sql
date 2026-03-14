-- ============================================================
-- Zé Mesada Simulator — Schema Supabase
-- Rodar no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. SALDO VIRTUAL DO ZÉ MESADA
CREATE TABLE IF NOT EXISTS bankroll (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance    DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO bankroll (balance, updated_by)
VALUES (100.00, 'system')
ON CONFLICT DO NOTHING;

-- 2. APOSTAS REALIZADAS (histórico)
CREATE TABLE IF NOT EXISTS bets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       TEXT NOT NULL,
  home_team      TEXT NOT NULL,
  away_team      TEXT NOT NULL,
  home_logo      TEXT,
  away_logo      TEXT,
  league         TEXT NOT NULL,
  league_logo    TEXT,
  league_country TEXT NOT NULL,
  match_date     TIMESTAMPTZ NOT NULL,
  bet_type       TEXT NOT NULL CHECK (bet_type IN ('home','draw','away')),
  odds           DECIMAL(5,2) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  result         TEXT DEFAULT 'pending' CHECK (result IN ('win','loss','pending')),
  payout         DECIMAL(10,2),
  home_score     INT,
  away_score     INT,
  duende_quote   TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRÓXIMOS JOGOS / APOSTAS PENDENTES
CREATE TABLE IF NOT EXISTS upcoming_bets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       TEXT UNIQUE NOT NULL,
  home_team      TEXT NOT NULL,
  away_team      TEXT NOT NULL,
  home_logo      TEXT,
  away_logo      TEXT,
  league         TEXT NOT NULL,
  league_logo    TEXT,
  league_country TEXT NOT NULL,
  match_date     TIMESTAMPTZ NOT NULL,
  bet_type       TEXT NOT NULL CHECK (bet_type IN ('home','draw','away')),
  odds           DECIMAL(5,2) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  duende_quote   TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','settled','cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTEÚDO EDITÁVEL PELO ADMIN
CREATE TABLE IF NOT EXISTS content_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  type       TEXT DEFAULT 'text' CHECK (type IN ('text','markdown','image_url')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO content_blocks (key, value, type) VALUES
  ('pix_key',       'ze.mesada@pindaiba.com.br', 'text'),
  ('pix_name',      'Zé Mesada', 'text'),
  ('help_message',  'O milagre não vai se pagar sozinho! Me paga um salgado pra eu ter energia no meu próximo green "garantido" pelo Chicão!', 'text'),
  ('disclaimer',    'Nenhum dinheiro real é usado. As apostas são iguais ao Duende: SÓ IMAGINÁRIAS!', 'text'),
  ('qr_code_image', '', 'image_url')
ON CONFLICT (key) DO NOTHING;

-- 5. LOGS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level      TEXT NOT NULL CHECK (level IN ('info','warn','error')),
  event      TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level      ON system_logs (level);
CREATE INDEX IF NOT EXISTS idx_upcoming_bets_status   ON upcoming_bets (status);
CREATE INDEX IF NOT EXISTS idx_bets_match_date        ON bets (match_date DESC);

-- ============================================================
-- RLS — todo acesso via backend com service_role (ignora RLS)
-- ============================================================
ALTER TABLE bankroll       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_bets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs    ENABLE ROW LEVEL SECURITY;
