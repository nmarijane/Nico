"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGameStore } from "@/store/game-store";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import type { Player } from "@/types";

type TabType = "create" | "join";

export function GameLobby() {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [totalRounds, setTotalRounds] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    gameId,
    playerId,
    playerName: currentPlayerName,
    isHost,
    game,
    players,
    setGameId,
    setPlayer,
    setGame,
    setPlayers,
    logout,
  } = useGameStore();

  // Use realtime subscription instead of polling
  useRealtimeGame();

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, totalRounds, timePerQuestion }),
      });

      const data = await response.json();

      if (data.success) {
        setGameId(data.game.id);
        setPlayer(data.playerId, playerName, true);
        setGame(data.game);
        setPlayers(data.players);
      } else {
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || "Erreur lors de la création";
        setError(errorMsg);
        console.error("Erreur:", data);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: joinCode, playerName }),
      });

      const data = await response.json();

      if (data.success) {
        setGameId(data.game.id);
        setPlayer(data.playerId, playerName, false);
        setGame(data.game);
        setPlayers(data.players);
      } else {
        setError(data.error || "Erreur lors de la connexion");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/game", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, action: "start" }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Erreur lors du démarrage");
      }
      // Game state will be updated via realtime subscription
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGame = () => {
    setGameId(null);
    setGame(null);
    setPlayers([]);
  };

  // If already in a game lobby
  if (gameId && game?.status === "waiting") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Salle d&apos;attente</CardTitle>
          <CardDescription>
            Code de la partie:{" "}
            <span className="font-mono text-lg font-bold text-purple-600">
              {gameId}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Joueurs ({players.length})</Label>
            <div className="flex flex-wrap gap-2">
              {players.map((player: Player) => (
                <Badge
                  key={player.id}
                  variant={player.id === playerId ? "default" : "secondary"}
                  className={player.is_host ? "border-2 border-yellow-500" : ""}
                >
                  {player.is_host && "👑 "}
                  {player.name}
                  {player.id === playerId && " (vous)"}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>📊 {game.total_rounds} manches</p>
            <p>⏱️ {game.time_per_question} secondes par question</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isHost ? (
            <div className="space-y-2">
              <Button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={players.length < 1 || isLoading}
              >
                {isLoading ? "Démarrage..." : "🚀 Lancer la partie"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Partagez le code avec vos amis pour qu&apos;ils rejoignent
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                En attente que l&apos;hôte lance la partie...
              </p>
            </div>
          )}

          <Button variant="outline" onClick={handleLeaveGame} className="w-full">
            Quitter la partie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          🎬 Bienvenue, {currentPlayerName || "Joueur"}!
        </CardTitle>
        <CardDescription>
          Créez une partie ou rejoignez-en une existante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("create")}
          >
            Créer
          </Button>
          <Button
            variant={activeTab === "join" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("join")}
          >
            Rejoindre
          </Button>
        </div>

        {activeTab === "create" ? (
          <form onSubmit={handleCreateGame} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="createName">Votre pseudo</Label>
              <Input
                id="createName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre pseudo..."
                required
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rounds">Nombre de manches ({totalRounds})</Label>
              <Input
                id="rounds"
                type="range"
                min="3"
                max="10"
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Temps par question ({timePerQuestion}s)
              </Label>
              <Input
                id="time"
                type="range"
                min="15"
                max="60"
                step="5"
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer la partie"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleJoinGame} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinName">Votre pseudo</Label>
              <Input
                id="joinName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre pseudo..."
                required
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code de la partie</Label>
              <Input
                id="code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                required
                maxLength={8}
                className="font-mono uppercase"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Rejoindre"}
            </Button>
          </form>
        )}

        <Button variant="ghost" onClick={logout} className="w-full">
          Se déconnecter
        </Button>
      </CardContent>
    </Card>
  );
}
