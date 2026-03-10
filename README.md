# FitTracker 🏋️

Plateforme fitness intelligente — Comparateur de produits, Coach IA, Nutrition, Suivi de progression.

## Stack technique

- **Frontend** : Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend** : FastAPI (Python 3.12) + SQLAlchemy 2.0
- **Base de données** : PostgreSQL 16
- **Cache** : Redis 7
- **IA** : Claude API (Anthropic) pour la génération de programmes et plans nutrition
- **Conteneurisation** : Docker Compose

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- (Optionnel) Clé API Anthropic pour le Coach IA

### Installation

```bash
# 1. Cloner le repo
git clone <repo-url>
cd fittracker

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec ta clé API Anthropic (optionnel)

# 3. Lancer tout le stack
docker-compose up -d

# 4. Accéder à l'app
# Frontend : http://localhost:3000
# API docs : http://localhost:8000/docs
# API :      http://localhost:8000/api/v1/
```

## Structure du projet

```
fittracker/
├── docker-compose.yml          # Orchestration des services
├── .env.example                # Variables d'environnement template
│
├── backend/                    # API FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── init.sql                # Seed data (exercices, catégories)
│   └── app/
│       ├── main.py             # Point d'entrée FastAPI
│       ├── config.py           # Configuration centralisée
│       ├── database.py         # Connection pool SQLAlchemy
│       ├── models/             # Modèles SQLAlchemy
│       │   └── __init__.py     # User, Product, Workout, Nutrition, etc.
│       ├── api/                # Routes API
│       │   ├── auth.py         # Register, Login, Refresh, Me
│       │   ├── products.py     # Catalogue, Comparateur, Commentaires
│       │   ├── coach.py        # Programmes IA, Exercices, Log séances
│       │   └── tracking.py     # Profil, Nutrition, Métriques corporelles
│       ├── services/           # Logique métier
│       │   ├── coach_ai.py     # Intégration Claude API
│       │   └── calculations.py # BMR, TDEE, Macros, 1RM, Calories
│       └── core/
│           └── security.py     # JWT, Hashing, Auth middleware
│
└── frontend/                   # Next.js (à développer)
    ├── Dockerfile
    └── src/
```

## API Endpoints

### Auth
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Profil connecté |

### Produits
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/products` | Liste avec filtres/tri |
| GET | `/api/v1/products/{id}` | Détail produit |
| GET | `/api/v1/products/{id}/comments` | Commentaires |
| POST | `/api/v1/products/{id}/comments` | Ajouter commentaire |
| POST | `/api/v1/products/{id}/favorite` | Toggle favori |
| GET | `/api/v1/products/compare?ids=1,2,3` | Comparer |
| GET | `/api/v1/products/categories` | Catégories |

### Coach IA
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/coach/generate-program` | Générer programme IA |
| GET | `/api/v1/coach/programs` | Mes programmes |
| GET | `/api/v1/coach/programs/{id}` | Détail programme |
| GET | `/api/v1/coach/exercises` | Base d'exercices |
| POST | `/api/v1/coach/workouts/log` | Logger une séance |
| GET | `/api/v1/coach/workouts/history` | Historique |

### Profil & Suivi
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/PUT | `/api/v1/profile` | Profil fitness |
| POST | `/api/v1/nutrition/log` | Logger un aliment |
| GET | `/api/v1/nutrition/daily` | Bilan du jour |
| POST | `/api/v1/metrics` | Ajouter mesure |
| GET | `/api/v1/metrics` | Historique mesures |

## Fonctionnalités

### ✅ Implémenté (Backend)
- [x] Auth complète (JWT, register, login, refresh)
- [x] Catalogue produits avec filtres, tri, pagination
- [x] Comparateur multi-produits (2-5)
- [x] Commentaires sur produits
- [x] Favoris produits
- [x] Profil fitness éditable avec calcul auto BMR/TDEE/macros
- [x] Coach IA — Génération de programmes via Claude API
- [x] Coach IA — Fallback template sans clé API
- [x] Base de 27 exercices avec MET values
- [x] Log de séances avec calcul volume/calories
- [x] Journal alimentaire avec totaux quotidiens
- [x] Suivi corporel (poids, mensurations)
- [x] 5 catégories de produits (whey, créatine, BCAA, pre-workout, barres)

### 🔜 Prochaines étapes
- [ ] Frontend Next.js complet
- [ ] Génération plans nutrition IA
- [ ] Historique de prix + alertes
- [ ] Système d'achievements
- [ ] Migration scraper ProteinScan
- [ ] Recherche Meilisearch
- [ ] Notifications push
- [ ] Tests unitaires & intégration

## Sans clé API Anthropic

Le Coach IA fonctionne avec ou sans clé API :
- **Avec clé** : programmes générés par Claude (personnalisés, périodisation avancée)
- **Sans clé** : programmes templates basiques (PPL, volumes standard)

## Licence

Projet privé — tous droits réservés.
