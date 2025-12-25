import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "quiz.db");

// Ensure database directory exists
import fs from "fs";
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'waiting',
    current_round INTEGER DEFAULT 0,
    total_rounds INTEGER DEFAULT 5,
    time_per_question INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    is_host INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    media_type TEXT NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    overview TEXT,
    hints TEXT,
    started_at DATETIME,
    ended_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  );
`);

export { db };

// Helper functions
export function createGame(id: string, totalRounds: number = 5, timePerQuestion: number = 30) {
  const stmt = db.prepare(`
    INSERT INTO games (id, total_rounds, time_per_question)
    VALUES (?, ?, ?)
  `);
  return stmt.run(id, totalRounds, timePerQuestion);
}

export function getGame(id: string) {
  const stmt = db.prepare("SELECT * FROM games WHERE id = ?");
  return stmt.get(id);
}

export function updateGameStatus(id: string, status: string, currentRound?: number) {
  if (currentRound !== undefined) {
    const stmt = db.prepare(`
      UPDATE games SET status = ?, current_round = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(status, currentRound, id);
  }
  const stmt = db.prepare(`
    UPDATE games SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(status, id);
}

export function addPlayer(id: string, gameId: string, name: string, isHost: boolean = false) {
  const stmt = db.prepare(`
    INSERT INTO players (id, game_id, name, is_host)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(id, gameId, name, isHost ? 1 : 0);
}

export function getPlayer(id: string) {
  const stmt = db.prepare("SELECT * FROM players WHERE id = ?");
  return stmt.get(id);
}

export function getPlayersByGame(gameId: string) {
  const stmt = db.prepare("SELECT * FROM players WHERE game_id = ? ORDER BY score DESC");
  return stmt.all(gameId);
}

export function updatePlayerScore(id: string, points: number) {
  const stmt = db.prepare(`
    UPDATE players SET score = score + ?
    WHERE id = ?
  `);
  return stmt.run(points, id);
}

export function createRound(
  id: string,
  gameId: string,
  roundNumber: number,
  mediaId: number,
  mediaType: string,
  title: string,
  posterPath: string | null,
  overview: string,
  hints: string
) {
  const stmt = db.prepare(`
    INSERT INTO rounds (id, game_id, round_number, media_id, media_type, title, poster_path, overview, hints)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(id, gameId, roundNumber, mediaId, mediaType, title, posterPath, overview, hints);
}

export function getRound(id: string) {
  const stmt = db.prepare("SELECT * FROM rounds WHERE id = ?");
  return stmt.get(id);
}

export function getRoundsByGame(gameId: string) {
  const stmt = db.prepare("SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number");
  return stmt.all(gameId);
}

export function getCurrentRound(gameId: string) {
  const stmt = db.prepare(`
    SELECT r.* FROM rounds r
    JOIN games g ON g.id = r.game_id
    WHERE r.game_id = ? AND r.round_number = g.current_round
  `);
  return stmt.get(gameId);
}

export function startRound(roundId: string) {
  const stmt = db.prepare(`
    UPDATE rounds SET started_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(roundId);
}

export function endRound(roundId: string) {
  const stmt = db.prepare(`
    UPDATE rounds SET ended_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(roundId);
}

export function recordAnswer(
  id: string,
  roundId: string,
  playerId: string,
  answer: string,
  isCorrect: boolean,
  pointsEarned: number
) {
  const stmt = db.prepare(`
    INSERT INTO answers (id, round_id, player_id, answer, is_correct, points_earned)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(id, roundId, playerId, answer, isCorrect ? 1 : 0, pointsEarned);
}

export function getAnswersByRound(roundId: string) {
  const stmt = db.prepare(`
    SELECT a.*, p.name as player_name 
    FROM answers a
    JOIN players p ON p.id = a.player_id
    WHERE a.round_id = ?
  `);
  return stmt.all(roundId);
}

export function hasPlayerAnswered(roundId: string, playerId: string) {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM answers
    WHERE round_id = ? AND player_id = ?
  `);
  const result = stmt.get(roundId, playerId) as { count: number };
  return result.count > 0;
}

export function deleteGame(id: string) {
  const stmt = db.prepare("DELETE FROM games WHERE id = ?");
  return stmt.run(id);
}
