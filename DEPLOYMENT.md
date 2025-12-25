# 🚀 Guide de Déploiement - Film Quiz

Ce guide vous accompagne pas à pas pour déployer l'application Film Quiz en production.

## Prérequis

- Un compte GitHub
- Un compte Vercel (gratuit)
- Un compte Supabase (gratuit)
- Un compte TMDB (gratuit)

## Étape 1: Créer le projet Supabase

### 1.1 Créer un nouveau projet

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Cliquez sur **New Project**
3. Choisissez un nom et un mot de passe pour la base de données
4. Sélectionnez la région la plus proche de vos utilisateurs
5. Attendez que le projet soit créé (~2 minutes)

### 1.2 Configurer la base de données

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query**
3. Copiez-collez le contenu du fichier `supabase/schema.sql`
4. Cliquez sur **Run** (ou Ctrl+Enter)
5. Vérifiez que toutes les tables ont été créées sans erreur

### 1.3 Récupérer les clés API

1. Allez dans **Settings** (icône engrenage) > **API**
2. Notez les valeurs suivantes:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (longue chaîne)

## Étape 2: Obtenir la clé API TMDB

1. Créez un compte sur [themoviedb.org](https://www.themoviedb.org/signup)
2. Allez dans votre profil > **Settings** > **API**
3. Cliquez sur **Request an API Key**
4. Choisissez "Developer" et acceptez les conditions
5. Remplissez le formulaire (vous pouvez mettre des infos basiques)
6. Copiez votre **API Key (v3 auth)**

## Étape 3: Déployer sur Vercel

### 3.1 Importer le projet

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous avec GitHub
2. Cliquez sur **Add New...** > **Project**
3. Importez le repository `film-quiz`

### 3.2 Configurer les variables d'environnement

Avant de déployer, ajoutez ces variables:

| Nom | Valeur |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://votre-projet.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre clé anon Supabase |
| `TMDB_API_KEY` | Votre clé API TMDB |
| `GAME_PASSWORD` | Le mot de passe que vous souhaitez pour le jeu |

### 3.3 Déployer

1. Cliquez sur **Deploy**
2. Attendez que le build soit terminé (~1-2 minutes)
3. Votre application est en ligne! 🎉

## Étape 4: Vérification

1. Ouvrez l'URL fournie par Vercel
2. Entrez le mot de passe que vous avez configuré
3. Créez une partie test
4. Ouvrez une fenêtre privée et rejoignez la partie
5. Testez le jeu!

## Configuration avancée

### Domaine personnalisé

1. Dans Vercel, allez dans **Settings** > **Domains**
2. Ajoutez votre domaine
3. Configurez les DNS comme indiqué

### Nettoyage automatique des parties

Les parties terminées depuis plus de 24h et les parties en attente depuis plus de 2h sont automatiquement supprimées. Pour activer ce nettoyage:

1. Dans Supabase, allez dans **Database** > **Functions**
2. Créez une fonction planifiée qui appelle `cleanup_old_games()`

### Monitoring

- **Vercel**: Analytics intégrées dans le dashboard
- **Supabase**: Logs et métriques dans le dashboard

## Dépannage

### "Missing Supabase environment variables"
- Vérifiez que les variables d'environnement sont bien configurées dans Vercel
- Redéployez après avoir ajouté les variables

### "TMDB API error"
- Vérifiez que votre clé TMDB est valide
- Assurez-vous de ne pas dépasser les limites de l'API

### Les joueurs ne voient pas les mises à jour en temps réel
- Vérifiez que Realtime est activé dans Supabase (Settings > API > Realtime)
- Vérifiez que les tables sont ajoutées à la publication `supabase_realtime`

## Support

Pour toute question, ouvrez une issue sur GitHub!
