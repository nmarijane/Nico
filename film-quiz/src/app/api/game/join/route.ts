import { NextRequest, NextResponse } from "next/server";
import { getGame, addPlayer, getPlayersByGame } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { gameId, playerName } = await request.json();

    if (!gameId || !playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Game ID et nom du joueur requis" },
        { status: 400 }
      );
    }

    const normalizedGameId = gameId.toUpperCase();
    const game = await getGame(normalizedGameId);

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
    const players = await getPlayersByGame(normalizedGameId);
    const nameExists = players.some(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (nameExists) {
      return NextResponse.json(
        { success: false, error: "Ce nom est déjà utilisé" },
        { status: 400 }
      );
    }

    const player = await addPlayer(normalizedGameId, playerName.trim(), false);
    const updatedPlayers = await getPlayersByGame(normalizedGameId);

    return NextResponse.json({
      success: true,
      game,
      playerId: player.id,
      players: updatedPlayers,
    });
  } catch (error) {
    console.error("Error joining game:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}
