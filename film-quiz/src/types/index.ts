export type MediaType = "movie" | "tv";

export type GameStatus = "waiting" | "playing" | "round_end" | "finished";

export interface Game {
  id: string;
  status: GameStatus;
  current_round: number;
  total_rounds: number;
  time_per_question: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  score: number;
  is_host: number;
  joined_at: string;
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  media_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  overview: string;
  hints: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface Answer {
  id: string;
  round_id: string;
  player_id: string;
  answer: string;
  is_correct: number;
  points_earned: number;
  answered_at: string;
  player_name?: string;
}

export interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMedia[];
  total_pages: number;
  total_results: number;
}

export interface Hint {
  type: "year" | "genre" | "overview" | "rating" | "letter";
  value: string;
  revealed: boolean;
}

export interface GameState {
  gameId: string | null;
  playerId: string | null;
  playerName: string | null;
  isHost: boolean;
  isAuthenticated: boolean;
}

export interface QuizQuestion {
  roundId: string;
  roundNumber: number;
  mediaType: MediaType;
  posterUrl: string | null;
  hints: Hint[];
  timeRemaining: number;
  hasAnswered: boolean;
}

export interface RoundResult {
  roundNumber: number;
  title: string;
  mediaType: MediaType;
  posterPath: string | null;
  answers: Answer[];
  correctAnswer: string;
}
