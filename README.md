# 🎓 Application Web de Gestion des Visiteurs — EFET AGADIR

Application web full-stack sécurisée et prête pour la production pour la gestion numérique des visiteurs (futurs étudiants) et des conseillers en orientation de l'école **EFET AGADIR**.

---

## 📋 Table des Matières

1. [Présentation & Objectifs](#-présentation--objectifs)
2. [Stack Technique](#-stack-technique)
3. [Architecture du Projet](#-architecture-du-projet)
4. [Modèle de Données (Prisma)](#-modèle-de-données-prisma)
5. [Installation & Configuration](#-installation--configuration)
6. [Configuration Supabase (PostgreSQL)](#-configuration-supabase-postgresql)
7. [Initialisation de la Base de Données (Prisma)](#-initialisation-de-la-base-de-données-prisma)
8. [Lancement de l'Application](#-lancement-de-lapplication)
9. [Identifiants par Défaut (Seed)](#-identifiants-par-défaut-seed)
10. [Documentation des Endpoints API](#-documentation-des-endpoints-api)
11. [Système QR Code & Sécurité](#-système-qr-code--sécurité)
12. [Charte Graphique & Palette de Couleurs](#-charte-graphique--palette-de-couleurs)

---

## 🎯 Présentation & Objectifs

EFET AGADIR accueille quotidiennement des futurs étudiants orientés par des conseillers en orientation lors des visites sur site, des forums ou des événements.

Cette solution permet de :
1. **Remplacer le bulletin de visite papier** par un formulaire tactile moderne accessible sur tablette ou smartphone.
2. **Attribuer automatiquement le visiteur** au bon orientateur grâce à un QR code personnel scanné sur place (`/visite?ref=<code>`).
3. **Fournir à la direction un tableau de bord complet** pour visualiser l'affluence, analyser les filières les plus demandées, suivre le classement des orientateurs et exporter les fiches au format CSV / Excel.

---

## 🛠️ Stack Technique

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | React 18 + Vite | Interface réactive, formulaire tactile, dashboard admin |
| **Routing** | React Router v6 | Navigation client avec routes protégées |
| **Formulaires & Validation** | React Hook Form + Zod | Saisie fluide et validation stricte des entrées |
| **Graphiques** | Recharts | Visualisation statistique temps réel |
| **Backend / API** | Node.js + Express.js | API REST paramétrée et sécurisée |
| **ORM** | Prisma v6 | Requêtes typées et sécurisées contre les injections SQL |
| **Base de Données** | Supabase (PostgreSQL) | Base de données relationnelle managée |
| **Authentification** | JWT + bcrypt (12 rounds) | Access token (15 min) + Refresh token (7 jours) |
| **QR Code** | qrcode | Génération dynamique à la volée côté serveur (PNG / SVG) |
| **Sécurité** | Helmet, CORS, Rate Limit | Protection HTTP headers, whitelist CORS, anti-brute force |

---

## 📂 Architecture du Projet

```text
PROJET VISITEURS/
├── package.json               # Scripts d'orchestration globaux
├── .gitignore
├── README.md
├── server/                    # 🚀 API REST Express + Prisma
│   ├── package.json
│   ├── server.js              # Point d'entrée de l'API (Helmet, CORS, Rate Limiting)
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma relationnel complet PostgreSQL
│   │   └── seed.js            # Initialisation admin + 32 formations + 16 sources
│   └── src/
│       ├── config/
│       │   ├── database.js    # Singleton Prisma Client
│       │   └── validation.js  # Schémas de validation Zod stricts
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── orientateurController.js
│       │   ├── visiteurController.js
│       │   ├── formationController.js
│       │   ├── sourceController.js
│       │   └── statsController.js
│       ├── middlewares/
│       │   ├── auth.js        # Vérification du Bearer Token JWT
│       │   ├── validation.js  # Validation Zod des requêtes entrantes
│       │   ├── rateLimit.js   # Limitation de débit anti-abus
│       │   └── errorHandler.js# Gestion unifiée des erreurs & codes Prisma
│       └── routes/
│           ├── authRoutes.js
│           ├── orientateurRoutes.js
│           ├── visiteurRoutes.js
│           ├── formationRoutes.js
│           ├── sourceRoutes.js
│           └── statsRoutes.js
└── client/                    # 💻 Application React + Vite
    ├── package.json
    ├── vite.config.js         # Configuration du proxy API local (/api -> :5000)
    ├── index.html             # Typographie Google Font "Inter"
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx            # Configuration du routage public et admin
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── AdminLayout.jsx# Sidebar responsive, header, profil et déconnexion
        │   └── QRCodeModal.jsx# Impression et téléchargement PNG du QR code
        ├── context/
        │   └── AuthContext.jsx# État d'authentification global avec refresh automatique
        ├── pages/
        │   ├── public/
        │   │   └── BulletinVisite.jsx  # Formulaire public interactif (/visite)
        │   └── admin/
        │       ├── Login.jsx           # Connexion administration
        │       ├── Dashboard.jsx       # Vue d'ensemble avec graphiques Recharts
        │       ├── Visiteurs.jsx       # Tableau filtrable, détails et export CSV
        │       ├── Orientateurs.jsx    # Gestion CRUD, QR codes et stats conseillers
        │       ├── Referentiels.jsx    # Gestion des Formations et Sources
        │       └── Profil.jsx          # Modification sécurisée du mot de passe
        ├── services/
        │   └── api.js         # Client Axios avec intercepteur JWT & refresh
        └── styles/
            └── index.css      # Design System EFET AGADIR & variables CSS
```

---

## 🗄️ Modèle de Données (Prisma)

- **Admin** : `id`, `email` (unique), `passwordHash`, `nom`, `createdAt`
- **Orientateur** : `id`, `nom`, `prenom`, `code` (8 caractères uniques), `actif` (booléen), `createdAt`, `updatedAt`
- **Visiteur** :
  - `dateVisite`, `heureVisite` (générés côté serveur)
  - `numeroOrdre` (entier auto-incrémenté par jour, remis à 1 chaque minuit)
  - `nomPrenom`, `dateNaissance`, `lieuNaissance`, `sexe` (`F` / `M`)
  - `adresse`, `quartier`, `ville`, `telephone`, `email`
  - `niveauScolaire` (`BAC`, `NIVEAU_BAC`, `BAC_2`, `BAC_3`)
  - `etablissement`, `optionBac` (`SC_EXP`, `SC_MATH`, `SC_ECO`, `TECHNIQUE`, `LM`, `AUTRES`)
  - `professionPere`, `professionMere`, `professionVisiteur`
  - `orientateurId` (clé étrangère nullable)
- **Formation** : `id`, `nom`, `categorie` (`BAC3_TS_LP`, `BAC2_TECHNICIEN`, `SANTE`, `BACHELOR`, `MASTER`)
- **VisiteurFormation** : table de jointure many-to-many
- **SourceConnaissance** : `id`, `libelle`
- **VisiteurSource** : table de jointure many-to-many

---

## 🚀 Installation & Configuration

### 1. Cloner ou ouvrir le projet

```bash
cd "PROJET VISITEURS"
```

### 2. Installer les dépendances

Vous pouvez installer les dépendances du serveur et du client en une seule commande depuis la racine :
```bash
npm run install:all
```
*(ou indépendamment : `cd server && npm install`, puis `cd ../client && npm install`)*

---

## ☁️ Configuration Supabase (PostgreSQL)

1. Rendez-vous sur [Supabase](https://supabase.com) et créez un nouveau projet.
2. Allez dans **Project Settings** > **Database**.
3. Dans la section **Connection String**, copiez l'URI **URI** (mode Direct ou Session Pooler).
4. Exemple d'URL :
   ```env
   DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[VOTRE_ID_PROJET].supabase.co:5432/postgres"
   ```
5. Créez le fichier `server/.env` en copiant le fichier `server/.env.example` et renseignez votre URL Supabase :
   ```bash
   cp server/.env.example server/.env
   ```

---

## ⚡ Initialisation de la Base de Données (Prisma)

Depuis la racine du projet :

```bash
# 1. Générer le client Prisma
npm run prisma:generate

# 2. Pousser le schéma vers la base Supabase
npm run prisma:push

# 3. Exécuter le seed pour injecter le compte admin et les référentiels officiels
npm run prisma:seed
```

> **Note :** Le script de seed est idempotent (utilise `upsert`). Il peut être relancé à tout moment sans créer de doublons.

---

## 💻 Lancement de l'Application

### En Développement

Ouvrez deux terminaux :

**Terminal 1 : Serveur API (port 5000)**
```bash
npm run dev:server
```

**Terminal 2 : Frontend React (port 5173)**
```bash
npm run dev:client
```

- **Formulaire public des visiteurs :** [http://localhost:5173/visite](http://localhost:5173/visite)
- **Test avec un orientateur scanné :** [http://localhost:5173/visite?ref=XXXXXXXX](http://localhost:5173/visite?ref=XXXXXXXX)
- **Dashboard d'administration :** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Santé de l'API :** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Identifiants par Défaut (Seed)

Le script de seed génère le compte administrateur initial suivant :

- **Email :** `admin@efet-agadir.ma`
- **Mot de passe :** `Admin@2024!`

*(Ce mot de passe peut être modifié à tout moment depuis la rubrique **Mon Compte** de l'espace d'administration).*

---

## 📡 Documentation des Endpoints API

### Authentification (`/api/auth`)
- `POST /api/auth/login` : Connexion admin (Rate limited : 10 req/15 min) -> Renvoie `accessToken`, `refreshToken`, `admin`.
- `POST /api/auth/refresh` : Renouvelle l'access token avec le refresh token.
- `GET /api/auth/me` *(Protégé)* : Informations de l'admin connecté.
- `PUT /api/auth/password` *(Protégé)* : Modification sécurisée du mot de passe.

### Orientateurs (`/api/orientateurs`)
- `GET /api/orientateurs/verify/:code` *(Public)* : Vérifie si un code orientateur est valide et actif. Renvoie uniquement `nom` et `prenom` (jamais d'ID interne).
- `GET /api/orientateurs` *(Protégé)* : Liste paginée des orientateurs avec filtres de recherche et compteurs de visiteurs.
- `POST /api/orientateurs` *(Protégé)* : Création d'un orientateur avec génération d'un code unique de 8 caractères.
- `PUT /api/orientateurs/:id` *(Protégé)* : Modification des informations ou activation/désactivation.
- `DELETE /api/orientateurs/:id` *(Protégé)* : Suppression avec blocage de sécurité si des visiteurs y sont rattachés.
- `GET /api/orientateurs/:id/qrcode` *(Protégé)* : Flux binaire PNG ou SVG du QR Code encodant l'URL `/visite?ref=<code>`.
- `GET /api/orientateurs/:id/qrcode-data` *(Protégé)* : Données complètes et image Base64 pour impression de la fiche.
- `GET /api/orientateurs/:id/stats` *(Protégé)* : Statistiques individuelles (jour, semaine, mois, historique).

### Visiteurs (`/api/visiteurs`)
- `POST /api/visiteurs` *(Public)* : Soumission du bulletin de visite (Rate limited : 20 req/15 min). Calcul automatique de la date, heure et du numéro d'ordre par jour côté serveur.
- `GET /api/visiteurs` *(Protégé)* : Liste paginée des visiteurs avec filtres (recherche globale, période de date, orientateur, formation, niveau scolaire).
- `GET /api/visiteurs/:id` *(Protégé)* : Fiche détaillée d'un visiteur avec toutes les filières et sources cochées.
- `GET /api/visiteurs/export` *(Protégé)* : Export direct au format CSV encodé en UTF-8 avec BOM pour compatibilité Excel.

### Formations (`/api/formations`)
- `GET /api/formations` *(Public)* : Liste complète des filières groupées par catégories.
- `POST /api/formations` *(Protégé)* : Création d'une nouvelle filière.
- `PUT /api/formations/:id` *(Protégé)* : Modification d'une filière.
- `DELETE /api/formations/:id` *(Protégé)* : Suppression avec vérification d'intégrité référentielle.

### Sources de Connaissance (`/api/sources`)
- `GET /api/sources` *(Public)* : Liste des sources de notoriété (Réseaux, Lycées, Amis, etc.).
- `POST /api/sources` *(Protégé)* : Ajout d'une source.
- `PUT /api/sources/:id` *(Protégé)* : Modification d'une source.
- `DELETE /api/sources/:id` *(Protégé)* : Suppression d'une source non rattachée.

### Statistiques (`/api/stats`)
- `GET /api/stats/overview` *(Protégé)* : Vue globale du dashboard (compteurs, évolution 30 jours, distributions, top formations, classement orientateurs).
- `GET /api/stats/orientateurs` *(Protégé)* : Classement complet des orientateurs.

---

## 🔒 Système QR Code & Sécurité

1. **Intégrité de l'attribution :** Le frontend ne transmet jamais d'ID interne orientateur. Il transmet uniquement le paramètre `refCode`. Le backend contrôle l'existence et l'état actif du conseiller avant d'établir la relation dans la base de données.
2. **Protection SQL Injection :** Utilisation stricte de Prisma avec requêtes paramétrées.
3. **Protection XSS & En-têtes HTTP :** Helmet.js activé sur l'API et échappement natif de React.
4. **CORS strict :** Seules les origines autorisées (domaine configuré dans `.env`) sont acceptées.
5. **Anti-Brute Force / Anti-Spam :** `express-rate-limit` appliqué spécifiquement sur le login admin et la création de bulletins de visite.
6. **Mots de passe sécurisés :** Hachage avec `bcrypt` à 12 rounds.
7. **Logs d'audit :** Journalisation en console de toutes les actions sensibles (création/suppression de conseillers, modifications de référentiels, changements de mot de passe).

---

## 🎨 Charte Graphique & Palette de Couleurs

L'interface utilise rigoureusement la palette institutionnelle imposée :

| Variable CSS | Hexadécimal | Utilisation |
|---|---|---|
| `--deep-space-blue` | `#012a4a` | Fonds sombres, headers, sidebar admin |
| `--yale-blue-1` | `#013a63` | Dégradés primaires, en-têtes de tableaux |
| `--yale-blue-2` | `#01497c` | Boutons principaux, accents forts |
| `--dusk-blue` | `#014f86` | Survols et éléments secondaires |
| `--rich-cerulean` | `#2a6f97` | Liens actifs, textes mis en valeur |
| `--cerulean` | `#2c7da0` | Boutons d'action, CTA, icônes |
| `--blue-green` | `#468faf` | Graphiques, badges de statut |
| `--pacific-blue` | `#61a5c2` | Éléments interactifs secondaires |
| `--sky-blue-light` | `#89c2d9` | Fonds clairs, bordures sélectionnées |
| `--light-blue` | `#a9d6e5` | Arrière-plans très clairs, zones de survol |

---

Développé pour **EFET AGADIR** — École Française d'Enseignement Technique.
