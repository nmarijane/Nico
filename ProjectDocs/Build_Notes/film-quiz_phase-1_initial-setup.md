# Film Quiz Application - Phase 1: Initial Setup

## Task Objective
Créer une application web de quiz multijoueur permettant aux utilisateurs de deviner des noms de films et séries avec un système de timer, de points par manche, et de désignation du gagnant final.

## Current State Assessment
- Workspace vide avec seulement un README basique
- Aucune structure de projet existante

## Future State Goal
- Application Next.js 15+ fonctionnelle
- Base de données SQLite pour la gestion des parties et joueurs
- Intégration avec l'API TMDB pour les films et séries
- Interface utilisateur moderne avec Shadcn UI
- Système de quiz avec timer et indices progressifs
- Système de points et classement

## Implementation Plan

### Step 1: Project Setup
- [x] Créer le projet Next.js 15+ avec TypeScript
- [x] Installer les dépendances (Zustand, better-sqlite3, uuid)
- [x] Configurer Shadcn UI et les composants nécessaires
- [x] Configurer Tailwind CSS avec thème personnalisé

### Step 2: Database Structure
- [x] Créer le schéma SQLite (games, players, rounds, answers)
- [x] Implémenter les fonctions CRUD pour la base de données
- [x] Ajouter les types TypeScript correspondants

### Step 3: TMDB Integration
- [x] Configurer l'accès à l'API TMDB
- [x] Implémenter la récupération de films et séries populaires
- [x] Créer le système de génération d'indices
- [x] Implémenter la vérification des réponses (avec tolérance)

### Step 4: Authentication
- [x] Créer la page de connexion avec mot de passe commun
- [x] Implémenter l'API d'authentification
- [x] Gérer l'état d'authentification avec Zustand

### Step 5: Game Lobby
- [x] Créer l'interface de création de partie
- [x] Créer l'interface pour rejoindre une partie
- [x] Afficher la liste des joueurs dans la salle d'attente
- [x] Permettre à l'hôte de lancer la partie

### Step 6: Quiz Game
- [x] Créer le composant de question avec poster flouté
- [x] Implémenter le timer countdown
- [x] Afficher les indices progressivement
- [x] Gérer la soumission des réponses
- [x] Calculer et attribuer les points

### Step 7: Results
- [x] Créer la page de résultats de manche
- [x] Créer la page de résultats finaux avec classement
- [x] Ajouter des animations de célébration (confetti)
- [x] Permettre de rejouer

## Technical Notes

### Architecture
- Next.js 15+ App Router avec Server Components
- Zustand pour la gestion d'état côté client
- SQLite (better-sqlite3) pour la persistance
- API TMDB pour les données de films/séries

### Features Implemented
1. **Authentification**: Mot de passe commun configurable
2. **Lobby**: Création/Rejoindre avec code de partie
3. **Quiz**: Timer, indices progressifs, poster flouté
4. **Points**: Système dégressif (100, 80, 60... selon l'ordre)
5. **Résultats**: Classement en temps réel et final

### Configuration Required
- `TMDB_API_KEY`: Clé API TMDB (obtenir sur themoviedb.org)
- `GAME_PASSWORD`: Mot de passe pour accéder au jeu
