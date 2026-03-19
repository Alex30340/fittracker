# FitTracker × ProteinScan — Version fusionnée

Application fitness + comparateur de whey protéines indépendant.
Backend FastAPI (routes séparées) + Frontend Next.js connecté à l'API.

## Démarrage

```bash
# Backend
cd backend
cp .env.example .env       # configurer DATABASE_URL + BRAVE_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000/docs

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

## Pages connectées à l'API

- Landing : top produits réels + stats catalogue
- Catalogue : 83 produits, recherche, filtres, tri, mode classement avec rangs
- Fiche produit : aminogramme, offres multiples, score breakdown
- Comparateur : suggestions pré-faites, tableau comparatif
- Dashboard : stats réelles + TDEE calculé par API
- Nutrition : BMR/TDEE/macros (Mifflin-St Jeor)
- Profil : calcul personnalisé via API
- Admin : lancer Discovery/Refresh, stats, historique pipelines
- Login/Register : auth JWT avec AuthContext
- Coach : 6 programmes avec détail exercices
- Progression : graphique D3, 12 semaines de données

## Pipeline Discovery

Même système que Replit : POST /api/admin/discovery lance le scraping automatique via Brave Search.
