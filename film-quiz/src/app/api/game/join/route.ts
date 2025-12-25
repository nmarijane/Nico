import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getGame, addPlayer, getPlayersByGame } from "@/lib/db";
import type { Game, Player } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { gameId, playerName } = await request.json();

    if (!gameId || !playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Game ID et nom du joueur requis" },
        { status: 400 }
      );
    }

    const game = getGame(gameId.toUpperCase()) as Game | undefined;

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Partie non trouvée" },
        { status: 404 }
      );
    }

    if (game.status !== "waiting") {
      return NextResponse.json(
        { success: false, error: "La partie a déjà commencé" },
        { status: 400 }
      );
    }

    // Check if player name already exists
    const players = getPlayersByGame(gameId.toUpperCase()) as Player[];
    const nameExists = players.some(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (nameExists) {
      return NextResponse.json(
        { success: false, error: "Ce nom est déjà utilisé" },
        { status: 400 }
      );
    }

    const playerId = uuidv4();
    addPlayer(playerId, gameId.toUpperCase(), playerName.trim(), false);

    const updatedPlayers = getPlayersByGame(gameId.toUpperCase()) as Player[];

    return NextResponse.json({
      success: true,
      game,
      playerId,
      players: updatedPlayers,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}
