"use client";

import { GameController } from "@/components/game-controller";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <GameController />
      </div>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>🎬 Film Quiz - Propulsé par TMDB</p>
      </footer>
    </main>
  );
}
