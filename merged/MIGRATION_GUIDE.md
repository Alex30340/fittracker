# FitTracker × ProteinScan — Plan de Migration
## Streamlit → FastAPI + Next.js/React

---

## Architecture Cible

```
fittracker/
├── backend/                    # Python — FastAPI
│   ├── main.py                 # Point d'entrée FastAPI + CORS
│   ├── requirements.txt        
│   ├── core/                   # Logique métier (inchangée)
│   │   ├── db.py               # ← ton db.py actuel (tel quel)
│   │   ├── scoring.py          # ← ton scoring.py actuel (tel quel)
│   │   ├── auth.py             # ← ton auth.py + JWT
│   │   ├── scraper.py          # ← ton scraper.py (tel quel)
│   │   ├── extractor.py        # ← tel quel
│   │   ├── nutrition_extractor.py
│   │   ├── multi_source_extractor.py
│   │   ├── browser_scraper.py
│   │   ├── page_validator.py
│   │   ├── resolver.py
│   │   └── validator.py
│   ├── api/                    # Routes API REST
│   │   ├── products.py         # /api/products, /api/products/{id}
│   │   ├── compare.py          # /api/compare
│   │   ├── auth_routes.py      # /api/auth/login, /api/auth/register
│   │   ├── reviews.py          # /api/reviews
│   │   ├── favorites.py        # /api/favorites
│   │   ├── pipeline.py         # /api/admin/pipeline (discovery/refresh)
│   │   └── stats.py            # /api/stats
│   └── seed_data.json          # ← tel quel
│
├── frontend/                   # Next.js / React (ton FitTracker existant)
│   ├── src/
│   │   ├── app/                # Pages Next.js
│   │   │   ├── page.tsx        # Landing
│   │   │   ├── dashboard/
│   │   │   ├── catalogue/
│   │   │   ├── produit/[id]/
│   │   │   ├── comparateur/
│   │   │   ├── coach/
│   │   │   ├── nutrition/
│   │   │   ├── progression/
│   │   │   └── profil/
│   │   ├── components/         # Composants React réutilisables
│   │   │   ├── ScoreRing.tsx
│   │   │   ├── RadarChart.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CompareTable.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   └── lib/
│   │       └── api.ts          # Client API (fetch vers FastAPI)
│   └── ...
```

---

## Ce qui change / ne change PAS

### ✅ NE CHANGE PAS (copier tel quel dans backend/core/)
- `db.py` → toute la couche base de données reste identique
- `scoring.py` → algorithme de scoring inchangé
- `scraper.py` → pipeline discovery/refresh
- `extractor.py`, `nutrition_extractor.py`, `multi_source_extractor.py`
- `browser_scraper.py`, `page_validator.py`, `resolver.py`, `validator.py`
- `seed_data.json`

### 🔄 CHANGE
- `app.py` (Streamlit) → **supprimé**, remplacé par :
  - `backend/main.py` + `backend/api/*.py` (routes FastAPI)
  - `frontend/src/app/**` (pages React)
- `auth.py` → enrichi avec JWT (jose/python-jose)

### ➕ NOUVEAU
- `backend/main.py` — serveur FastAPI
- `backend/api/` — toutes les routes REST
- Intégration dans ton frontend Next.js existant

---

## Étapes de Migration

### Phase 1 : Backend FastAPI (1-2 jours)
1. Copier `db.py`, `scoring.py`, `scraper.py`, etc. dans `backend/core/`
2. Créer `backend/main.py` avec FastAPI + CORS
3. Créer les routes API dans `backend/api/`
4. Ajouter JWT à `auth.py`
5. Tester avec Swagger UI (/docs)

### Phase 2 : Frontend React (2-3 jours)
1. Créer le client API (`lib/api.ts`)
2. Adapter le composant JSX que j'ai créé en pages Next.js
3. Intégrer dans ton FitTracker existant
4. Connecter les pages au backend

### Phase 3 : Déploiement
- Backend : Railway / Render / Fly.io (Python)
- Frontend : Vercel (Next.js)
- DB : garder ta PostgreSQL existante (Neon/Supabase)

---

## Mapping des routes API

| Streamlit (avant)                | FastAPI (après)                          |
|----------------------------------|------------------------------------------|
| `cached_get_all_products()`      | `GET /api/products`                      |
| `cached_get_product_by_id(id)`   | `GET /api/products/{id}`                 |
| `cached_get_product_offers(id)`  | `GET /api/products/{id}/offers`          |
| `get_products_by_ids(ids)`       | `POST /api/products/compare`             |
| `cached_get_catalog_stats()`     | `GET /api/stats/catalog`                 |
| `get_reviews_for_product(id)`    | `GET /api/products/{id}/reviews`         |
| `create_review(...)`             | `POST /api/products/{id}/reviews`        |
| `toggle_favorite(uid, pid)`      | `POST /api/favorites/toggle`             |
| `get_user_favorites(uid)`        | `GET /api/favorites`                     |
| `get_price_history(pid)`         | `GET /api/products/{id}/price-history`   |
| `create_user(...)`               | `POST /api/auth/register`                |
| `get_user_by_email(...)`         | `POST /api/auth/login`                   |
| `run_discovery(...)`             | `POST /api/admin/discovery`              |
| `run_refresh(...)`               | `POST /api/admin/refresh`                |
| `get_data_quality_stats()`       | `GET /api/admin/quality`                 |
