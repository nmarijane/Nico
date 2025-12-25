"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/store/game-store";
import type { Player } from "@/types";

export function GameResults() {
  const { players, playerName, reset, logout } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isWinner = winner?.name === playerName;

  useEffect(() => {
    // Trigger confetti for winner
    if (isWinner) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#9333ea", "#ec4899", "#f59e0b"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#9333ea", "#ec4899", "#f59e0b"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    } else {
      // Small celebration for everyone
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isWinner]);

  const handlePlayAgain = () => {
    reset();
  };

  const handleLeave = () => {
    logout();
  };

  const getMedal = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}.`;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">
          🎉 Partie terminée!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Winner announcement */}
        <div className="text-center py-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Le gagnant est</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🏆 {winner?.name}
          </p>
          <p className="text-2xl font-semibold mt-2">
            {winner?.score} points
          </p>
          {isWinner && (
            <Badge className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500">
              C&apos;est vous! Félicitations!
            </Badge>
          )}
        </div>

        {/* Final leaderboard */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Classement final</h3>
          {sortedPlayers.map((player: Player, index: number) => (
            <div
              key={player.id}
              className={`flex justify-between items-center p-3 rounded-lg ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-400"
                  : index === 1
                  ? "bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 border border-slate-300"
                  : index === 2
                  ? "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-300"
                  : "bg-muted"
              } ${player.name === playerName ? "ring-2 ring-purple-500" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMedal(index)}</span>
                <span className="font-medium">
                  {player.name}
                  {player.name === playerName && (
                    <span className="text-sm text-muted-foreground ml-1">
                      (vous)
                    </span>
                  )}
                </span>
              </div>
              <Badge
                variant={index === 0 ? "default" : "secondary"}
                className={index === 0 ? "bg-yellow-500" : ""}
              >
                {player.score} pts
              </Badge>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {sortedPlayers.length}
            </p>
            <p className="text-sm text-muted-foreground">Joueurs</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-pink-600">
              {sortedPlayers.reduce((sum, p) => sum + p.score, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Points totaux</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handlePlayAgain}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            🎮 Nouvelle partie
          </Button>
          <Button variant="outline" onClick={handleLeave} className="w-full">
            Quitter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
