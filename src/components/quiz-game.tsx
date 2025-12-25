"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGameStore } from "@/store/game-store";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import type { Hint, Answer, Player } from "@/types";

interface RoundData {
  id: string;
  roundNumber: number;
  totalRounds: number;
  mediaType: "movie" | "tv";
  posterUrl: string | null;
  hints: Hint[];
  timePerQuestion: number;
  hasAnswered: boolean;
}

interface RoundResult {
  roundNumber: number;
  title: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  answers: Answer[];
}

export function QuizGame() {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [revealedHints, setRevealedHints] = useState<number[]>([0]);

  const {
    gameId,
    playerId,
    isHost,
    game,
    players,
    timeRemaining,
    hasAnswered,
    setPlayers,
    setTimeRemaining,
    decrementTime,
    setHasAnswered,
  } = useGameStore();

  // Use realtime for game and player updates
  useRealtimeGame();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch round data
  const fetchRound = useCallback(async () => {
    if (!gameId || !playerId) return;

    try {
      const response = await fetch(
        `/api/round?gameId=${gameId}&playerId=${playerId}`
      );
      const data = await response.json();

      if (data.success) {
        setRoundData(data.round);
        setTimeRemaining(data.round.timePerQuestion);
        setHasAnswered(data.round.hasAnswered);
        setRevealedHints([0]);
        setIsCorrect(null);
        setPointsEarned(0);
        setAnswer("");
        setRoundResult(null);
      }
    } catch (err) {
      console.error("Error fetching round:", err);
    }
  }, [gameId, playerId, setTimeRemaining, setHasAnswered]);

  // Initial round fetch and when round changes
  useEffect(() => {
    if (game?.status === "playing") {
      // Check if we need to fetch a new round
      if (!roundData || roundData.roundNumber !== game.current_round) {
        fetchRound();
      }
    }
  }, [game?.status, game?.current_round, roundData, fetchRound]);

  // Timer countdown
  useEffect(() => {
    if (
      game?.status === "playing" &&
      roundData &&
      !hasAnswered &&
      timeRemaining > 0
    ) {
      timerRef.current = setInterval(decrementTime, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [game?.status, roundData, hasAnswered, timeRemaining, decrementTime]);

  // Auto-reveal hints based on time
  useEffect(() => {
    if (!roundData || hasAnswered || timeRemaining <= 0) return;

    const totalTime = roundData.timePerQuestion;
    const hintsCount = roundData.hints.length;
    const hintInterval = totalTime / hintsCount;
    const elapsedTime = totalTime - timeRemaining;
    const hintsToReveal = Math.min(
      Math.floor(elapsedTime / hintInterval) + 1,
      hintsCount
    );

    const newRevealed = Array.from({ length: hintsToReveal }, (_, i) => i);
    setRevealedHints(newRevealed);
  }, [roundData, timeRemaining, hasAnswered]);

  const handleEndRound = useCallback(async () => {
    if (!gameId || !roundData) return;

    try {
      // Get round results
      const resultResponse = await fetch("/api/round", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, roundId: roundData.id }),
      });

      const resultData = await resultResponse.json();

      if (resultData.success) {
        setRoundResult(resultData.result);
        setPlayers(resultData.players);
      }

      // Update game status to round_end
      await fetch("/api/game", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, action: "round_end" }),
      });
    } catch (err) {
      console.error("Error ending round:", err);
    }
  }, [gameId, roundData, setPlayers]);

  // Time's up - end round for host
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      roundData &&
      isHost &&
      game?.status === "playing"
    ) {
      handleEndRound();
    }
  }, [timeRemaining, roundData, isHost, game?.status, handleEndRound]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || hasAnswered || !gameId || !playerId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerId, answer: answer.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCorrect(data.isCorrect);
        setPointsEarned(data.pointsEarned);
        setHasAnswered(true);
      } else {
        setError(data.error || "Erreur lors de la soumission");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextRound = async () => {
    if (!gameId) return;

    try {
      await fetch("/api/game", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, action: "next_round" }),
      });
      
      // Game state will update via realtime, then trigger fetchRound
      setRoundData(null);
      setRoundResult(null);
    } catch (err) {
      console.error("Error advancing round:", err);
    }
  };

  // Show round results
  if (game?.status === "round_end" || roundResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Résultats de la manche {roundResult?.roundNumber || roundData?.roundNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {roundResult && (
            <>
              <div className="text-center">
                <Badge
                  variant="outline"
                  className="text-lg px-4 py-2 mb-4"
                >
                  {roundResult.mediaType === "movie" ? "🎬 Film" : "📺 Série"}
                </Badge>
                <h3 className="text-3xl font-bold text-purple-600 mb-4">
                  {roundResult.title}
                </h3>
                {roundResult.posterPath && (
                  <div className="flex justify-center mb-4">
                    <Image
                      src={roundResult.posterPath}
                      alt={roundResult.title}
                      width={200}
                      height={300}
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Réponses:</h4>
                {roundResult.answers.length === 0 ? (
                  <p className="text-muted-foreground">Aucune réponse</p>
                ) : (
                  <div className="space-y-2">
                    {roundResult.answers.map((a) => (
                      <div
                        key={a.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          a.is_correct
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        <span>
                          {a.player_name}: &quot;{a.answer}&quot;
                        </span>
                        {a.is_correct ? (
                          <Badge variant="default" className="bg-green-600">
                            +{a.points_earned} pts
                          </Badge>
                        ) : (
                          <Badge variant="destructive">✗</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold">Classement actuel:</h4>
            <div className="space-y-2">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p: Player, index: number) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span>
                      {index === 0 && "🥇 "}
                      {index === 1 && "🥈 "}
                      {index === 2 && "🥉 "}
                      {p.name}
                    </span>
                    <Badge>{p.score} pts</Badge>
                  </div>
                ))}
            </div>
          </div>

          {isHost && (
            <Button
              onClick={handleNextRound}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {game && roundData && roundData.roundNumber >= game.total_rounds
                ? "Voir les résultats finaux"
                : "Manche suivante"}
            </Button>
          )}

          {!isHost && (
            <p className="text-center text-muted-foreground">
              En attente de l&apos;hôte...
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show quiz question
  if (!roundData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">Chargement de la manche...</div>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = (timeRemaining / roundData.timePerQuestion) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">
            Manche {roundData.roundNumber}/{roundData.totalRounds}
          </Badge>
          <Badge
            variant={roundData.mediaType === "movie" ? "default" : "secondary"}
          >
            {roundData.mediaType === "movie" ? "🎬 Film" : "📺 Série"}
          </Badge>
        </div>
        <CardTitle className="text-center text-xl">
          Devinez le titre!
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Temps restant</span>
            <span
              className={timeRemaining <= 10 ? "text-red-500 font-bold" : ""}
            >
              {timeRemaining}s
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={`h-3 ${
              timeRemaining <= 10 ? "[&>div]:bg-red-500" : "[&>div]:bg-purple-600"
            }`}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Poster (blurred initially, clearer as time passes) */}
        {roundData.posterUrl && (
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src={roundData.posterUrl}
                alt="Poster du film/série"
                width={200}
                height={300}
                className="rounded-lg shadow-lg transition-all duration-1000"
                style={{
                  filter: `blur(${Math.max(0, (timeRemaining / roundData.timePerQuestion) * 15)}px)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Hints */}
        <div className="space-y-2">
          <h4 className="font-semibold">Indices:</h4>
          <div className="grid gap-2">
            {roundData.hints.map((hint, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  revealedHints.includes(index)
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200"
                    : "bg-muted border-transparent opacity-50"
                }`}
              >
                {revealedHints.includes(index) ? (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {hint.type === "genre" && "🎭 Genre"}
                      {hint.type === "year" && "📅 Année"}
                      {hint.type === "rating" && "⭐ Note"}
                      {hint.type === "overview" && "📝 Synopsis"}
                      {hint.type === "letter" && "🔤 Indice"}
                    </Badge>
                    <span className="text-sm">{hint.value}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Indice {index + 1} - bientôt révélé...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Answer form */}
        {!hasAnswered ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Entrez le titre du film ou de la série..."
              disabled={isLoading || timeRemaining === 0}
              className="text-lg"
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              disabled={isLoading || !answer.trim() || timeRemaining === 0}
            >
              {isLoading ? "Envoi..." : "Valider ma réponse"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            {isCorrect === true && (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  ✓ Bonne réponse!
                </p>
                <Badge variant="default" className="text-lg bg-green-600">
                  +{pointsEarned} points
                </Badge>
              </div>
            )}
            {isCorrect === false && (
              <p className="text-2xl font-bold text-red-600">
                ✗ Mauvaise réponse
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              En attente de la fin de la manche...
            </p>
          </div>
        )}

        {/* Players sidebar */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Joueurs:</h4>
          <div className="flex flex-wrap gap-2">
            {players.map((p: Player) => (
              <Badge
                key={p.id}
                variant={p.id === playerId ? "default" : "outline"}
              >
                {p.name}: {p.score} pts
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
