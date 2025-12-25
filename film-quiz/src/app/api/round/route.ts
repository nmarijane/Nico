import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getGame,
  getCurrentRound,
  getRound,
  startRound,
  endRound,
  recordAnswer,
  getAnswersByRound,
  hasPlayerAnswered,
  updatePlayerScore,
  getPlayersByGame,
} from "@/lib/db";
import { checkAnswer, getImageUrl } from "@/lib/tmdb";
import type { Game, Round, Answer, Player, Hint } from "@/types";

// Get current round info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const playerId = searchParams.get("playerId");

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "Game ID requis" },
        { status: 400 }
      );
    }

    const game = getGame(gameId) as Game | undefined;

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Partie non trouvée" },
        { status: 404 }
      );
    }

    const round = getCurrentRound(gameId) as Round | undefined;

    if (!round) {
      return NextResponse.json(
        { success: false, error: "Manche non trouvée" },
        { status: 404 }
      );
    }

    // Start the round if not already started
    if (!round.started_at) {
      startRound(round.id);
    }

    const hints = JSON.parse(round.hints) as Hint[];
    const playerAnswered = playerId ? hasPlayerAnswered(round.id, playerId) : false;

    // Don't reveal the answer if game is still playing
    const roundData = {
      id: round.id,
      roundNumber: round.round_number,
      totalRounds: game.total_rounds,
      mediaType: round.media_type,
      posterUrl: getImageUrl(round.poster_path),
      hints,
      timePerQuestion: game.time_per_question,
      hasAnswered: playerAnswered,
    };

    return NextResponse.json({
      success: true,
      round: roundData,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}

// Submit answer
export async function POST(request: NextRequest) {
  try {
    const { gameId, playerId, answer } = await request.json();

    if (!gameId || !playerId || !answer) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    const game = getGame(gameId) as Game | undefined;

    if (!game || game.status !== "playing") {
      return NextResponse.json(
        { success: false, error: "Partie non valide" },
        { status: 400 }
      );
    }

    const round = getCurrentRound(gameId) as Round | undefined;

    if (!round) {
      return NextResponse.json(
        { success: false, error: "Manche non trouvée" },
        { status: 404 }
      );
    }

    // Check if player already answered
    if (hasPlayerAnswered(round.id, playerId)) {
      return NextResponse.json(
        { success: false, error: "Vous avez déjà répondu" },
        { status: 400 }
      );
    }

    // Check the answer
    const isCorrect = checkAnswer(answer, round.title);
    
    // Calculate points based on answer order
    const existingAnswers = getAnswersByRound(round.id) as Answer[];
    const correctAnswersCount = existingAnswers.filter((a) => a.is_correct).length;
    
    // Points: 100 for first correct, 80 for second, 60 for third, etc.
    const pointsEarned = isCorrect ? Math.max(20, 100 - correctAnswersCount * 20) : 0;

    // Record the answer
    const answerId = uuidv4();
    recordAnswer(answerId, round.id, playerId, answer, isCorrect, pointsEarned);

    // Update player score
    if (pointsEarned > 0) {
      updatePlayerScore(playerId, pointsEarned);
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      pointsEarned,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}

// End round and get results
export async function PATCH(request: NextRequest) {
  try {
    const { gameId, roundId } = await request.json();

    if (!gameId || !roundId) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    const round = getRound(roundId) as Round | undefined;

    if (!round) {
      return NextResponse.json(
        { success: false, error: "Manche non trouvée" },
        { status: 404 }
      );
    }

    // End the round
    if (!round.ended_at) {
      endRound(roundId);
    }

    const answers = getAnswersByRound(roundId) as Answer[];
    const players = getPlayersByGame(gameId) as Player[];

    return NextResponse.json({
      success: true,
      result: {
        roundNumber: round.round_number,
        title: round.title,
        mediaType: round.media_type,
        posterPath: getImageUrl(round.poster_path),
        answers,
      },
      players,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}
