import { createServerClient } from "./supabase";
import type { Game, Player, Round, Answer } from "@/types";

// Game functions
export async function createGame(
  id: string,
  totalRounds: number = 5,
  timePerQuestion: number = 30
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("games")
    .insert({ id, total_rounds: totalRounds, time_per_question: timePerQuestion })
    .select()
    .single();

  if (error) throw error;
  return data as Game;
}

export async function getGame(id: string): Promise<Game | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Game | null;
}

export async function updateGameStatus(
  id: string,
  status: Game["status"],
  currentRound?: number
) {
  const supabase = createServerClient();
  const update: Partial<Game> = { status };
  
  if (currentRound !== undefined) {
    update.current_round = currentRound;
  }

  const { error } = await supabase
    .from("games")
    .update(update)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteGame(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw error;
}

// Player functions
export async function addPlayer(
  gameId: string,
  name: string,
  isHost: boolean = false
): Promise<Player> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("players")
    .insert({ game_id: gameId, name, is_host: isHost })
    .select()
    .single();

  if (error) throw error;
  return data as Player;
}

export async function getPlayer(id: string): Promise<Player | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Player | null;
}

export async function getPlayersByGame(gameId: string): Promise<Player[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("game_id", gameId)
    .order("score", { ascending: false });

  if (error) throw error;
  return (data || []) as Player[];
}

export async function updatePlayerScore(id: string, pointsToAdd: number) {
  const supabase = createServerClient();
  
  // First get current score
  const { data: player } = await supabase
    .from("players")
    .select("score")
    .eq("id", id)
    .single();

  if (!player) return;

  const { error } = await supabase
    .from("players")
    .update({ score: (player.score as number) + pointsToAdd })
    .eq("id", id);

  if (error) throw error;
}

// Round functions
export async function createRound(
  gameId: string,
  roundNumber: number,
  mediaId: number,
  mediaType: "movie" | "tv",
  title: string,
  posterPath: string | null,
  overview: string,
  hints: unknown
): Promise<Round> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("rounds")
    .insert({
      game_id: gameId,
      round_number: roundNumber,
      media_id: mediaId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      overview,
      hints,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Round;
}

export async function getRound(id: string): Promise<Round | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Round | null;
}

export async function getRoundsByGame(gameId: string): Promise<Round[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("game_id", gameId)
    .order("round_number");

  if (error) throw error;
  return (data || []) as Round[];
}

export async function getCurrentRound(gameId: string): Promise<Round | null> {
  const supabase = createServerClient();
  
  // First get the game's current round number
  const game = await getGame(gameId);
  if (!game) return null;

  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("game_id", gameId)
    .eq("round_number", game.current_round)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Round | null;
}

export async function startRound(roundId: string) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("rounds")
    .update({ started_at: new Date().toISOString() })
    .eq("id", roundId);

  if (error) throw error;
}

export async function endRound(roundId: string) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("rounds")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", roundId);

  if (error) throw error;
}

// Answer functions
export async function recordAnswer(
  roundId: string,
  playerId: string,
  answer: string,
  isCorrect: boolean,
  pointsEarned: number
): Promise<Answer> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("answers")
    .insert({
      round_id: roundId,
      player_id: playerId,
      answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Answer;
}

export async function getAnswersByRound(roundId: string): Promise<(Answer & { player_name: string })[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("answers")
    .select(`
      *,
      players!inner(name)
    `)
    .eq("round_id", roundId);

  if (error) throw error;
  
  // Transform the data to match expected format
  return (data || []).map((a: Record<string, unknown>) => ({
    ...(a as unknown as Answer),
    player_name: ((a.players as Record<string, unknown>)?.name as string) || "Unknown",
  }));
}

export async function hasPlayerAnswered(
  roundId: string,
  playerId: string
): Promise<boolean> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("round_id", roundId)
    .eq("player_id", playerId);

  if (error) throw error;
  return (count || 0) > 0;
}
