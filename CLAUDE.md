# Bookly — Instructions pour Claude

## Le projet

Bookly est une application mobile de PAL (pile à lire) et de suivi de lecture.
Un lecteur ajoute des livres à sa PAL (recherche ou scan du code-barres ISBN),
puis enregistre ses sessions de lecture pour suivre sa progression.

Projet de formation en binôme (certification CDA), évalué sur un barème.

## Stack technique

- **Frontend** : React Native avec Expo, en **TypeScript** (`frontend/`)
- **Backend** : Node.js + Express, en **TypeScript**, architecture **MVC** (`backend/`)
- **Base de données** : **MySQL** (driver `mysql2/promise`)
- **Authentification** : JWT (jsonwebtoken) + bcrypt
- **Données livres** : API Google Books, appelée **uniquement depuis le backend**, jamais depuis le frontend
- **Navigation** : React Navigation (Stack + Bottom Tabs)

Le frontend et le backend sont **strictement séparés** : le frontend ne communique
avec le backend que par des requêtes HTTP vers l'API. Aucun code partagé entre les deux.

## Architecture MVC du backend

Trajet d'une requête : `Route → Middleware → Controller → Model → Base de données`,
puis réponse JSON.

- **Models** (`models/`) : uniquement des requêtes SQL. Aucune logique, aucun `req`/`res`.
- **Controllers** (`controllers/`) : validation des données, logique métier, appel des models,
  réponse JSON avec le bon code HTTP (200, 201, 400, 401, 403, 404, 409, 500). C'est la « vue » de l'API.
- **Routes** (`routes/`) : associent une URL et une méthode HTTP à un controller. Aucune logique.
- **Middlewares** (`middlewares/`) : vérifications transverses (token, rôle).
- **Services** (`services/`) : appels aux API externes (Google Books).
- **Types** (`types/`) : interfaces et types partagés au sein du backend.

Règle : une couche n'appelle que la couche juste en dessous. Un controller n'écrit jamais de SQL,
une route n'appelle jamais un model directement.

## Structure

```
bookly/
├── backend/                     ← API Express (MVC)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts      → connexion MySQL (pool)
│   │   ├── models/              → M : requêtes SQL
│   │   │   ├── User.ts
│   │   │   ├── Book.ts
│   │   │   └── ReadingSession.ts
│   │   ├── controllers/         → C : logique + réponse JSON
│   │   │   ├── authController.ts
│   │   │   ├── bookController.ts
│   │   │   ├── readingSessionController.ts
│   │   │   ├── googleController.ts
│   │   │   └── adminController.ts
│   │   ├── routes/              → URL → controller
│   │   │   ├── authRoutes.ts
│   │   │   ├── bookRoutes.ts
│   │   │   ├── readingSessionRoutes.ts
│   │   │   ├── googleRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   ├── middlewares/
│   │   │   ├── verifyToken.ts
│   │   │   └── verifyRole.ts
│   │   ├── services/
│   │   │   └── googleBooks.ts   → appels à l'API Google Books
│   │   ├── types/               → interfaces (User, Book, ReadingSession, requêtes...)
│   │   ├── app.ts               → configuration d'Express + branchement des routes
│   │   └── server.ts            → démarrage du serveur
│   ├── tsconfig.json
│   └── .env
└── frontend/                    ← Appli React Native (Expo, TypeScript)
    ├── src/ (screens, components, services, context, navigation, theme, types)
    ├── tsconfig.json
    └── .env
```

## Modèle de données (MySQL)

- **users** : id, email, password (hashé), role (`reader` | `admin`), created_at
- **books** : id, user_id, google_id, title, author, total_pages, cover_url, status (`to_read` | `reading` | `read`), added_at
- **reading_sessions** : id, book_id, session_date, start_page, end_page, duration_minutes, comment

- Un utilisateur a plusieurs livres, un livre a plusieurs sessions.
- Clés étrangères avec `ON DELETE CASCADE` : users → books → reading_sessions.
- Contrainte `UNIQUE (user_id, google_id)` : pas de doublon dans une PAL.
- `role` et `status` en `ENUM`. Moteur InnoDB, encodage `utf8mb4`.

## Variables d'environnement

- **backend/.env** : `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `GOOGLE_BOOKS_KEY`
- **frontend/.env** : `EXPO_PUBLIC_API_URL`

## Commandes

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npx expo start
cd frontend && npx expo start -c    # en vidant le cache
```

- Côté frontend, installer les paquets avec `npx expo install`, jamais `npm install`.
- Environnement : Windows + Git Bash + MySQL (WAMP). Donner des commandes compatibles Git Bash.

## Conventions de code

- **Tout le nommage est en anglais** : variables, fonctions, fichiers, dossiers, routes, tables, colonnes.
- **Seuls les commentaires sont en français**, courts et concis (une ligne, uniquement quand c'est utile).
- **Tout est typé** : TypeScript en mode `strict`, aucun `any`. Typer les paramètres, les retours
  de fonctions, les props des composants, les `req`/`res` d'Express et les résultats des requêtes SQL.
- Interfaces dans `types/` : `User`, `Book`, `ReadingSession`, corps de requêtes et réponses de l'API.
- Composants React en PascalCase, un composant par fichier.
- `async/await` plutôt que `.then()`.
- Chaque route de l'API vérifie que la ressource appartient à l'utilisateur connecté.
- Les requêtes SQL utilisent toujours des paramètres (`?`), jamais de concaténation.
- Les couleurs viennent du thème (`src/theme/`), jamais écrites en dur dans les écrans.
- Chaque élément interactif a un `accessibilityLabel`.

## Comment m'aider (important)

- **Explique avant de coder** : dis ce que tu vas faire et pourquoi, en quelques phrases.
- **Avance par petites étapes** : une fonctionnalité à la fois.
  Ne génère pas plusieurs fichiers d'un coup sans que je l'aie demandé.
- **Ne modifie pas un fichier sans me dire lequel et ce qui change.**
- **Demande avant d'installer un nouveau paquet.**
- **N'écris pas de tests** et ne lance pas de tests.
- **N'exécute aucune commande Git** (pas de commit, push, merge...) : je m'en occupe.
- Si ma demande pose un problème (sécurité, mauvaise pratique), dis-le franchement et propose mieux.
- Ne touche jamais aux fichiers `.env` et ne mets jamais de secret dans le code.

## Répartition du binôme

- **Personne A** : service + routes Google Books, CRUD Books (model, controller, routes),
  écrans Search / Scanner / Library / BookDetail, filtres et tri, dark mode, icône et splashscreen.
- **Personne B** : auth (register, login, JWT, rôles), middlewares, CRUD ReadingSessions
  (model, controller, routes), admin, api.ts, AuthContext, navigation par rôle,
  écrans Login / Register / SessionForm / Profile / Admin.

Travail sur des branches séparées (`feature/...`), fusion dans `main` quand ça marche.

## Rappels du barème

- Au moins 2 entités avec un CRUD complet et robuste (Books + ReadingSessions).
- Navigation différente selon le rôle (reader / admin).
- Composant natif : caméra pour scanner l'ISBN.
- Contrastes WCAG AA et navigation testée avec VoiceOver.
- Icône et splashscreen personnalisés dans `app.json`.
- Bonus : dark mode avec choix persistant, filtres et tri sur la PAL.