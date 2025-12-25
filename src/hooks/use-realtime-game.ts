"use client";

import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/store/game-store";
import type { Game, Player } from "@/types";

export function useRealtimeGame() {
  const { gameId, setGame, setPlayers, game } = useGameStore();

  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;

    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("game_id", gameId)
      .order("score", { ascending: false });

    if (data) {
      setPlayers(data as Player[]);
    }
  }, [gameId, setPlayers]);

  const fetchGame = useCallback(async () => {
    if (!gameId) return;

    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (data) {
      setGame(data as Game);
    }
  }, [gameId, setGame]);

  useEffect(() => {
    if (!gameId) return;

    // Initial fetch
    fetchGame();
    fetchPlayers();

    // Subscribe to game changes
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            setGame(payload.new as Game);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch all players to ensure correct order
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, setGame, fetchPlayers, fetchGame]);

  return { game, refetchGame: fetchGame, refetchPlayers: fetchPlayers };
}
