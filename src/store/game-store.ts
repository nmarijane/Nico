"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState, Player, Game, Hint, Answer } from "@/types";

interface ExtendedGameState extends GameState {
  game: Game | null;
  players: Player[];
  hints: Hint[];
  timeRemaining: number;
  hasAnswered: boolean;
  roundAnswers: Answer[];
  
  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setGameId: (gameId: string | null) => void;
  setPlayer: (playerId: string, playerName: string, isHost: boolean) => void;
  setGame: (game: Game | null) => void;
  setPlayers: (players: Player[]) => void;
  setHints: (hints: Hint[]) => void;
  revealHint: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  setHasAnswered: (hasAnswered: boolean) => void;
  setRoundAnswers: (answers: Answer[]) => void;
  updatePlayerScore: (playerId: string, points: number) => void;
  reset: () => void;
  logout: () => void;
}

const initialState = {
  gameId: null,
  playerId: null,
  playerName: null,
  isHost: false,
  isAuthenticated: false,
  game: null,
  players: [],
  hints: [],
  timeRemaining: 30,
  hasAnswered: false,
  roundAnswers: [],
};

export const useGameStore = create<ExtendedGameState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      setGameId: (gameId) => set({ gameId }),
      
      setPlayer: (playerId, playerName, isHost) => 
        set({ playerId, playerName, isHost }),
      
      setGame: (game) => set({ game }),
      
      setPlayers: (players) => set({ players }),
      
      setHints: (hints) => set({ hints }),
      
      revealHint: (index) => 
        set((state) => ({
          hints: state.hints.map((hint, i) => 
            i === index ? { ...hint, revealed: true } : hint
          ),
        })),
      
      setTimeRemaining: (time) => set({ timeRemaining: time }),
      
      decrementTime: () => 
        set((state) => ({ 
          timeRemaining: Math.max(0, state.timeRemaining - 1) 
        })),
      
      setHasAnswered: (hasAnswered) => set({ hasAnswered }),
      
      setRoundAnswers: (roundAnswers) => set({ roundAnswers }),
      
      updatePlayerScore: (playerId, points) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, score: p.score + points } : p
          ),
        })),
      
      reset: () => set({
        game: null,
        hints: [],
        timeRemaining: 30,
        hasAnswered: false,
        roundAnswers: [],
      }),
      
      logout: () => set(initialState),
    }),
    {
      name: "film-quiz-storage",
      partialize: (state) => ({
        gameId: state.gameId,
        playerId: state.playerId,
        playerName: state.playerName,
        isHost: state.isHost,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
