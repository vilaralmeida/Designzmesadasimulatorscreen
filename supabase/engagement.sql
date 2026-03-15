-- ── FASE 12: Módulo de Engajamento ──────────────────────────────────────────

-- Perfis de usuário (complementa auth.users do Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username    text UNIQUE NOT NULL,
  avatar_url  text,
  balance     numeric NOT NULL DEFAULT 100,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver o ranking
CREATE POLICY "public read profiles" ON user_profiles
  FOR SELECT USING (true);

-- Usuário só edita o próprio perfil
CREATE POLICY "user update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Inserção feita automaticamente no signup via trigger
CREATE POLICY "insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: cria user_profile automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────

-- Apostas feitas pelos usuários nos jogos do dia
CREATE TABLE IF NOT EXISTS user_bets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES user_profiles ON DELETE CASCADE,
  upcoming_bet_id uuid NOT NULL REFERENCES upcoming_bets ON DELETE CASCADE,
  bet_type        text NOT NULL CHECK (bet_type IN ('home', 'draw', 'away')),
  amount          numeric NOT NULL CHECK (amount BETWEEN 1 AND 10),
  odds            numeric NOT NULL,
  result          text CHECK (result IN ('win', 'loss')),  -- null = pendente
  payout          numeric,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, upcoming_bet_id)  -- 1 palpite por jogo por usuário
);
ALTER TABLE user_bets ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas suas próprias apostas
CREATE POLICY "user read own bets" ON user_bets
  FOR SELECT USING (auth.uid() = user_id);

-- Usuário só insere suas próprias apostas
CREATE POLICY "user insert own bets" ON user_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────

-- Snapshot diário do ranking (gerado pelo scheduler)
CREATE TABLE IF NOT EXISTS daily_ranking (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_date  date NOT NULL,
  user_id     uuid REFERENCES user_profiles ON DELETE CASCADE,
  username    text NOT NULL,
  avatar_url  text,
  balance     numeric NOT NULL,
  daily_pnl   numeric NOT NULL DEFAULT 0,
  position    int NOT NULL,
  vs_duende   text NOT NULL CHECK (vs_duende IN ('above', 'below', 'equal')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (round_date, user_id)
);
ALTER TABLE daily_ranking ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver o ranking
CREATE POLICY "public read ranking" ON daily_ranking
  FOR SELECT USING (true);
