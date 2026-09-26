#!/bin/bash
# ==============================================================================
# SkillIntel EC2 Production Deployment & Update Script
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

echo "==> [SkillIntel Deploy] Validating environment file..."
if [ ! -f .env ]; then
    echo "Error: .env file missing in $ROOT_DIR"
    echo "Please copy .env.example to .env and configure DATABASE_URL and GROQ_API_KEY."
    exit 1
fi

echo "==> [SkillIntel Deploy] Pulling latest updates from Git (if in git repo)..."
if [ -d .git ]; then
    git pull || echo "Git pull skipped or working tree has changes."
fi

echo "==> [SkillIntel Deploy] Building and launching containers via Docker Compose..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml up -d --build

echo "==> [SkillIntel Deploy] Checking container status..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "==> [SkillIntel Deploy] Cleaning up dangling images..."
docker image prune -f

echo "==> [SkillIntel Deploy] Deployment successful!"
echo "Visit http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo 'YOUR_EC2_IP') in your browser."
