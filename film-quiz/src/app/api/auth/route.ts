import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.GAME_PASSWORD || "filmquiz2024";

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Mot de passe incorrect" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur de serveur" },
      { status: 500 }
    );
  }
}
