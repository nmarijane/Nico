import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createGame,
  getGame,
  addPlayer,
  getPlayersByGame,
  updateGameStatus,
  createRound,
  deleteGame,
} from "@/lib/db";
import { getRandomMedia, generateHints, getMediaTitle } from "@/lib/tmdb";
import type { Game, Player } from "@/types";

// Create a new game
export async function POST(request: NextRequest) {
  try {
    const { playerName, totalRounds = 5, timePerQuestion = 30 } = await request.json();

    if (!playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Le nom du joueur est requis" },
        { status: 400 }
      );
    }

    const gameId = uuidv4().slice(0, 8).toUpperCase();
    const playerId = uuidv4();

    // Create the game
    createGame(gameId, totalRounds, timePerQuestion);

    // Add the host player
    addPlayer(playerId, gameId, playerName.trim(), true);

    // Generate rounds with random media
    const media = await getRandomMedia(totalRounds);
    
    for (let i = 0; i < media.length; i++) {
      const m = media[i];
      const hints = generateHints(m);
      const roundId = uuidv4();
      
      createRound(
        roundId,
        gameId,
        i + 1,
        m.id,
        m.mediaType,
        getMediaTitle(m),
        m.poster_path,
        m.overview,
        JSON.stringify(hints)
      );
    }

    const game = getGame(gameId) as Game;
    const players = getPlayersByGame(gameId) as Player[];

    return NextResponse.json({
      success: true,
      game,
      playerId,
      players,
    });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la partie" },
      { status: 500 }
    );
  }
}

// Get game info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

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

    const players = getPlayersByGame(gameId) as Player[];

    return NextResponse.json({
      success: true,
      game,
      players,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}

// Update game (start, next round, end)
export async function PATCH(request: NextRequest) {
  try {
    const { gameId, action } = await request.json();

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

    switch (action) {
      case "start":
        updateGameStatus(gameId, "playing", 1);
        break;
      case "next_round":
        const nextRound = game.current_round + 1;
        if (nextRound > game.total_rounds) {
          updateGameStatus(gameId, "finished");
        } else {
          updateGameStatus(gameId, "playing", nextRound);
        }
        break;
      case "round_end":
        updateGameStatus(gameId, "round_end");
        break;
      case "finish":
        updateGameStatus(gameId, "finished");
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Action invalide" },
          { status: 400 }
        );
    }

    const updatedGame = getGame(gameId) as Game;
    const players = getPlayersByGame(gameId) as Player[];

    return NextResponse.json({
      success: true,
      game: updatedGame,
      players,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}

// Delete game
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "Game ID requis" },
        { status: 400 }
      );
    }

    deleteGame(gameId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}
