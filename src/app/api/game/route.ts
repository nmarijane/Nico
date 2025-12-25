import { NextRequest, NextResponse } from "next/server";
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

    // Generate a short game ID
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log(`📝 Création de la partie ${gameId}...`);

    // Create the game
    await createGame(gameId, totalRounds, timePerQuestion);
    console.log(`✅ Partie créée`);

    // Add the host player
    const player = await addPlayer(gameId, playerName.trim(), true);
    console.log(`✅ Joueur hôte ajouté: ${playerName}`);

    // Generate rounds with random media
    console.log(`🎬 Récupération des films/séries...`);
    const media = await getRandomMedia(totalRounds);
    console.log(`✅ ${media.length} médias récupérés`);
    
    for (let i = 0; i < media.length; i++) {
      const m = media[i];
      const hints = generateHints(m);
      
      await createRound(
        gameId,
        i + 1,
        m.id,
        m.mediaType,
        getMediaTitle(m),
        m.poster_path,
        m.overview,
        hints
      );
    }
    console.log(`✅ ${media.length} manches créées`);

    const game = await getGame(gameId);
    const players = await getPlayersByGame(gameId);

    return NextResponse.json({
      success: true,
      game,
      playerId: player.id,
      players,
    });
  } catch (error) {
    console.error("❌ Erreur création partie:", error);
    
    // Message d'erreur plus détaillé
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de la création de la partie",
        details: errorMessage
      },
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

    const game = await getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Partie non trouvée" },
        { status: 404 }
      );
    }

    const players = await getPlayersByGame(gameId);

    return NextResponse.json({
      success: true,
      game,
      players,
    });
  } catch (error) {
    console.error("❌ Erreur récupération partie:", error);
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

    const game = await getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Partie non trouvée" },
        { status: 404 }
      );
    }

    switch (action) {
      case "start":
        await updateGameStatus(gameId, "playing", 1);
        break;
      case "next_round":
        const nextRound = game.current_round + 1;
        if (nextRound > game.total_rounds) {
          await updateGameStatus(gameId, "finished");
        } else {
          await updateGameStatus(gameId, "playing", nextRound);
        }
        break;
      case "round_end":
        await updateGameStatus(gameId, "round_end");
        break;
      case "finish":
        await updateGameStatus(gameId, "finished");
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Action invalide" },
          { status: 400 }
        );
    }

    const updatedGame = await getGame(gameId);
    const players = await getPlayersByGame(gameId);

    return NextResponse.json({
      success: true,
      game: updatedGame,
      players,
    });
  } catch (error) {
    console.error("❌ Erreur mise à jour partie:", error);
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

    await deleteGame(gameId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression partie:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}
