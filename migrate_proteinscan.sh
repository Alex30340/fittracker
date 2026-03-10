#!/bin/bash
# ============================================================
# FitTracker - Script de migration depuis ProteinScan
# ============================================================
# Ce script copie les fichiers du scraper ProteinScan
# dans le nouveau backend FitTracker.
#
# Usage:
#   chmod +x migrate_proteinscan.sh
#   ./migrate_proteinscan.sh /path/to/proteinscan
# ============================================================

set -e

PROTEINSCAN_DIR="${1:-../proteinscan}"
LEGACY_DIR="backend/app/services/legacy"

echo "=================================="
echo " FitTracker - Migration ProteinScan"
echo "=================================="
echo ""

# Check source directory
if [ ! -d "$PROTEINSCAN_DIR" ]; then
    echo "❌ Répertoire ProteinScan introuvable: $PROTEINSCAN_DIR"
    echo "   Usage: ./migrate_proteinscan.sh /chemin/vers/proteinscan"
    exit 1
fi

# Create legacy directory
mkdir -p "$LEGACY_DIR"

# Files to copy
FILES=(
    "scraper.py"
    "extractor.py"
    "validator.py"
    "page_validator.py"
    "scoring.py"
    "multi_source_extractor.py"
    "nutrition_extractor.py"
    "browser_scraper.py"
    "resolver.py"
    "seed_data.json"
)

echo "📦 Copie des fichiers du scraper..."
echo ""

copied=0
for file in "${FILES[@]}"; do
    if [ -f "$PROTEINSCAN_DIR/$file" ]; then
        cp "$PROTEINSCAN_DIR/$file" "$LEGACY_DIR/$file"
        echo "  ✅ $file"
        ((copied++))
    else
        echo "  ⚠️  $file (non trouvé, optionnel)"
    fi
done

# Create __init__.py
touch "$LEGACY_DIR/__init__.py"

echo ""
echo "📋 $copied fichiers copiés dans $LEGACY_DIR/"
echo ""

# Add extra dependencies
echo "📦 Vérification des dépendances supplémentaires..."
EXTRA_DEPS="beautifulsoup4 lxml"
for dep in $EXTRA_DEPS; do
    if ! grep -q "$dep" backend/requirements.txt; then
        echo "$dep" >> backend/requirements.txt
        echo "  ✅ Ajouté: $dep"
    fi
done

echo ""
echo "=================================="
echo " ✅ Migration terminée !"
echo "=================================="
echo ""
echo "Prochaines étapes:"
echo ""
echo "1. Ajoute les variables d'environnement dans .env:"
echo "   BRAVE_API_KEY=ton_api_key_brave_search"
echo ""
echo "2. Lance le stack:"
echo "   docker-compose up -d"
echo ""
echo "3. Crée un compte admin:"
echo "   curl -X POST http://localhost:8000/api/v1/auth/register \\"
echo '     -H "Content-Type: application/json" \\'
echo '     -d '"'"'{"email":"admin@fittracker.fr","password":"admin1234","display_name":"Admin"}'"'"''
echo ""
echo "4. Passe le compte en admin (dans psql):"
echo "   docker-compose exec db psql -U fittracker -c \\"
echo "     \"UPDATE users SET role='admin' WHERE email='admin@fittracker.fr'\""
echo ""
echo "5. Importe les données seed:"
echo '   TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"email":"admin@fittracker.fr","password":"admin1234"}'"'"' | jq -r .access_token)'
echo ""
echo '   curl -X POST http://localhost:8000/api/v1/admin/import/seed \'
echo '     -H "Authorization: Bearer $TOKEN"'
echo ""
echo "6. Lance une découverte (nécessite BRAVE_API_KEY):"
echo '   curl -X POST "http://localhost:8000/api/v1/admin/pipeline/discovery?max_urls=30" \'
echo '     -H "Authorization: Bearer $TOKEN"'
echo ""
echo "7. Accède à l'app: http://localhost:3000"
echo "   API docs: http://localhost:8000/docs"
