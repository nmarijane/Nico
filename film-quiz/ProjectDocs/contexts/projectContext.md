# Film Quiz - Project Context

## Overview
Film Quiz est une application web de quiz multijoueur où les joueurs doivent deviner des noms de films et séries télévisées. Le jeu se déroule en plusieurs manches avec un timer, des indices progressifs, et un système de points.

## Core Features

### 1. Authentication
- Accès via un mot de passe commun partagé entre tous les joueurs
- Pas de création de compte nécessaire
- Session persistée localement

### 2. Game Flow
1. **Connexion**: Entrer le mot de passe du jeu
2. **Lobby**: Créer une partie ou rejoindre avec un code
3. **Attente**: Les joueurs rejoignent la salle d'attente
4. **Jeu**: L'hôte lance la partie, les manches se succèdent
5. **Résultat**: Affichage du classement final et du gagnant

### 3. Quiz Mechanics
- Chaque manche présente un film ou une série à deviner
- Le poster est affiché de manière floue et se clarifie avec le temps
- Des indices sont révélés progressivement (genre, année, note, synopsis, première lettre)
- Les joueurs ont un temps limité pour répondre
- Les réponses sont validées avec tolérance (accents, fautes mineures)

### 4. Scoring System
- Points dégressifs selon l'ordre de réponse correcte:
  - 1er: 100 points
  - 2ème: 80 points
  - 3ème: 60 points
  - etc. (minimum 20 points)

## Tech Stack

### Frontend
- **Next.js 15+**: Framework React avec App Router
- **React**: Interface utilisateur
- **Tailwind CSS v4**: Styling
- **Shadcn UI**: Composants UI
- **Zustand**: State management

### Backend
- **Next.js API Routes**: Endpoints REST
- **SQLite (better-sqlite3)**: Base de données locale
- **TMDB API**: Données films et séries

### External Services
- **TMDB (The Movie Database)**: Source des films et séries

## File Structure

```
film-quiz/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts
│   │   │   ├── game/route.ts
│   │   │   ├── game/join/route.ts
│   │   │   └── round/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # Shadcn components
│   │   ├── login-form.tsx
│   │   ├── game-lobby.tsx
│   │   ├── quiz-game.tsx
│   │   ├── game-results.tsx
│   │   └── game-controller.tsx
│   ├── lib/
│   │   ├── db.ts         # Database functions
│   │   ├── tmdb.ts       # TMDB API integration
│   │   └── utils.ts      # Utility functions
│   ├── store/
│   │   └── game-store.ts # Zustand store
│   └── types/
│       └── index.ts      # TypeScript types
├── data/                  # SQLite database (gitignored)
├── ProjectDocs/
│   ├── Build_Notes/
│   └── contexts/
└── .env.local            # Environment variables
```

## Database Schema

### games
- id (TEXT PRIMARY KEY)
- status (TEXT): waiting, playing, round_end, finished
- current_round (INTEGER)
- total_rounds (INTEGER)
- time_per_question (INTEGER)
- created_at, updated_at (DATETIME)

### players
- id (TEXT PRIMARY KEY)
- game_id (TEXT FK)
- name (TEXT)
- score (INTEGER)
- is_host (INTEGER)
- joined_at (DATETIME)

### rounds
- id (TEXT PRIMARY KEY)
- game_id (TEXT FK)
- round_number (INTEGER)
- media_id (INTEGER)
- media_type (TEXT): movie, tv
- title, poster_path, overview, hints (TEXT)
- started_at, ended_at (DATETIME)

### answers
- id (TEXT PRIMARY KEY)
- round_id, player_id (TEXT FK)
- answer (TEXT)
- is_correct (INTEGER)
- points_earned (INTEGER)
- answered_at (DATETIME)

## Environment Variables

```env
TMDB_API_KEY=          # Required: TMDB API key
GAME_PASSWORD=         # Required: Password to access the game
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with required variables
4. Get a TMDB API key from https://www.themoviedb.org/settings/api
5. Run development server: `npm run dev`
6. Open http://localhost:3000

## Future Improvements

- [ ] WebSocket pour temps réel (éviter le polling)
- [ ] Mode hors-ligne avec cache
- [ ] Historique des parties
- [ ] Différents modes de jeu (thématiques, années spécifiques)
- [ ] Support multi-langues
- [ ] PWA pour installation mobile
