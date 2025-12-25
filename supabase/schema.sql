-- ============================================
-- Film Quiz Database Schema for Supabase
-- ============================================
-- Instructions:
-- 1. Allez sur votre projet Supabase
-- 2. Cliquez sur "SQL Editor" dans le menu de gauche
-- 3. Cliquez sur "New query"
-- 4. Copiez-collez tout ce fichier
-- 5. Cliquez sur "Run" (ou Ctrl+Enter)
-- ============================================

-- Supprimer les tables existantes si elles existent (pour reset)
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS rounds CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS games CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'round_end', 'finished')),
  current_round INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 5,
  time_per_question INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  overview TEXT,
  hints JSONB,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_rounds_game_id ON rounds(game_id);
CREATE INDEX idx_answers_round_id ON answers(round_id);
CREATE INDEX idx_answers_player_id ON answers(player_id);

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- On désactive RLS pour simplifier (l'auth est gérée par mot de passe dans l'app)

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies pour accès public (anon key)
DROP POLICY IF EXISTS "Enable all access for games" ON games;
DROP POLICY IF EXISTS "Enable all access for players" ON players;
DROP POLICY IF EXISTS "Enable all access for rounds" ON rounds;
DROP POLICY IF EXISTS "Enable all access for answers" ON answers;

CREATE POLICY "Enable all access for games" ON games FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for players" ON players FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for rounds" ON rounds FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for answers" ON answers FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- REALTIME (optionnel)
-- ============================================
-- Décommentez ces lignes si vous voulez le temps réel

-- ALTER PUBLICATION supabase_realtime ADD TABLE games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE players;
-- ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
-- ALTER PUBLICATION supabase_realtime ADD TABLE answers;

-- ============================================
-- DONE! Vos tables sont prêtes.
-- ============================================
