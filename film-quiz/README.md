# 🎬 Film Quiz

Un jeu de quiz multijoueur pour deviner des noms de films et séries télévisées!

## ✨ Fonctionnalités

- 🔐 **Accès sécurisé** via mot de passe commun
- 👥 **Multijoueur** - Créez ou rejoignez une partie avec un code
- ⏱️ **Timer** - Temps limité par question (configurable)
- 🎯 **Indices progressifs** - Genre, année, note, synopsis, première lettre
- 🖼️ **Poster flouté** - Se clarifie au fil du temps
- 🏆 **Système de points** - Points dégressifs selon l'ordre de réponse
- 📊 **Classement** - En temps réel et final avec célébration

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm
- Clé API TMDB (gratuite sur [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

```bash
# Cloner le repository
git clone <repo-url>
cd film-quiz

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec votre clé TMDB et mot de passe
```

### Configuration

Créez un fichier `.env.local` avec:

```env
# Clé API TMDB - Obtenez la vôtre sur https://www.themoviedb.org/settings/api
TMDB_API_KEY=votre_cle_api_tmdb

# Mot de passe du jeu - Changez-le selon vos besoins
GAME_PASSWORD=filmquiz2024
```

### Lancement

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm start
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎮 Comment jouer

### Créer une partie

1. Entrez le mot de passe du jeu
2. Cliquez sur "Créer"
3. Entrez votre pseudo
4. Configurez le nombre de manches et le temps par question
5. Partagez le code de partie avec vos amis
6. Lancez la partie quand tout le monde est prêt

### Rejoindre une partie

1. Entrez le mot de passe du jeu
2. Cliquez sur "Rejoindre"
3. Entrez votre pseudo et le code de la partie

### Pendant le jeu

- Observez le poster flouté qui se clarifie
- Lisez les indices qui apparaissent progressivement
- Devinez le titre du film ou de la série
- Plus vous répondez vite et correctement, plus vous gagnez de points!

## 🏗️ Architecture technique

- **Frontend**: Next.js 15, React, Tailwind CSS, Shadcn UI
- **State**: Zustand
- **Backend**: Next.js API Routes
- **Base de données**: SQLite (better-sqlite3)
- **API externe**: TMDB (The Movie Database)

## 📁 Structure du projet

```
film-quiz/
├── src/
│   ├── app/              # Pages et API routes
│   ├── components/       # Composants React
│   ├── lib/              # Utilitaires et DB
│   ├── store/            # State management
│   └── types/            # Types TypeScript
├── data/                 # Base de données SQLite
└── ProjectDocs/          # Documentation du projet
```

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 Licence

MIT

---

Fait avec ❤️ et propulsé par [TMDB](https://www.themoviedb.org/)
