# 🎬 Film Quiz

Un jeu de quiz multijoueur pour deviner des noms de films et séries télévisées!

## ✨ Fonctionnalités

- 🔐 **Accès sécurisé** via mot de passe commun
- 👥 **Multijoueur temps réel** - Créez ou rejoignez une partie avec un code
- ⏱️ **Timer** - Temps limité par question (configurable)
- 🎯 **Indices progressifs** - Genre, année, note, synopsis, première lettre
- 🖼️ **Poster flouté** - Se clarifie au fil du temps
- 🏆 **Système de points** - Points dégressifs selon l'ordre de réponse
- 📊 **Classement** - En temps réel et final avec célébration

## 🚀 Déploiement Production

### Prérequis

1. **Compte Supabase** (gratuit) - [supabase.com](https://supabase.com)
2. **Clé API TMDB** (gratuite) - [themoviedb.org](https://www.themoviedb.org/settings/api)
3. **Compte Vercel** (gratuit) - [vercel.com](https://vercel.com)

### Étape 1: Configurer Supabase

1. Créez un nouveau projet sur [app.supabase.com](https://app.supabase.com)
2. Allez dans **SQL Editor** et exécutez le contenu de `supabase/schema.sql`
3. Récupérez vos clés dans **Settings > API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 2: Obtenir la clé TMDB

1. Créez un compte sur [themoviedb.org](https://www.themoviedb.org)
2. Allez dans **Settings > API**
3. Demandez une clé API (v3 auth)
4. Copiez la clé → `TMDB_API_KEY`

### Étape 3: Déployer sur Vercel

1. Forkez ce repository ou poussez-le sur GitHub
2. Importez le projet sur [vercel.com/new](https://vercel.com/new)
3. Configurez les variables d'environnement:

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
TMDB_API_KEY=votre_cle_tmdb
GAME_PASSWORD=votre_mot_de_passe_secret
```

4. Cliquez sur **Deploy**!

### Variables d'environnement

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Supabase Dashboard > Settings > API |
| `TMDB_API_KEY` | Clé API TMDB | themoviedb.org/settings/api |
| `GAME_PASSWORD` | Mot de passe du jeu | Choisissez-le vous-même |

## 💻 Développement local

```bash
# Cloner le repository
git clone <repo-url>
cd film-quiz

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🎮 Comment jouer

### Créer une partie
1. Entrez le mot de passe du jeu
2. Cliquez sur "Créer"
3. Entrez votre pseudo
4. Configurez le nombre de manches et le temps
5. Partagez le code de partie avec vos amis
6. Lancez quand tout le monde est prêt

### Rejoindre une partie
1. Entrez le mot de passe du jeu
2. Cliquez sur "Rejoindre"
3. Entrez votre pseudo et le code de la partie

### Pendant le jeu
- Observez le poster flouté qui se clarifie
- Lisez les indices qui apparaissent progressivement
- Devinez le titre du film ou de la série
- Plus vous répondez vite et correctement, plus vous gagnez de points!

## 🏗️ Architecture

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 15+, React, Tailwind CSS |
| UI Components | Shadcn UI |
| State Management | Zustand |
| Base de données | Supabase (PostgreSQL) |
| Temps réel | Supabase Realtime |
| API Films | TMDB |
| Hébergement | Vercel |

## 📁 Structure du projet

```
film-quiz/
├── src/
│   ├── app/              # Pages et API routes
│   ├── components/       # Composants React
│   ├── hooks/            # Custom hooks (realtime)
│   ├── lib/              # Utilitaires et DB
│   ├── store/            # State management
│   └── types/            # Types TypeScript
├── supabase/
│   └── schema.sql        # Schéma de base de données
└── ProjectDocs/          # Documentation
```

## 🔧 Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build production
npm run start    # Démarrer en production
npm run lint     # Vérifier le code
```

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 Licence

MIT

---

Fait avec ❤️ et propulsé par [Supabase](https://supabase.com) et [TMDB](https://www.themoviedb.org/)
