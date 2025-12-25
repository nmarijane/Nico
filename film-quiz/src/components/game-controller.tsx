"use client";

import { useGameStore } from "@/store/game-store";
import { LoginForm } from "@/components/login-form";
import { GameLobby } from "@/components/game-lobby";
import { QuizGame } from "@/components/quiz-game";
import { GameResults } from "@/components/game-results";

export function GameController() {
  const { isAuthenticated, game } = useGameStore();

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Game finished - show results
  if (game?.status === "finished") {
    return <GameResults />;
  }

  // Game playing or round end - show quiz
  if (game?.status === "playing" || game?.status === "round_end") {
    return <QuizGame />;
  }

  // Waiting or no game - show lobby
  return <GameLobby />;
}
