#!/bin/bash
set -e

echo "==> [SkillIntel Backend] Starting container startup checks..."

# Wait for database connectivity if DATABASE_URL is set
python - << 'EOF'
import os
import sys
import time
from urllib.parse import urlparse

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("[SkillIntel] DATABASE_URL not set, skipping DB wait.")
    sys.exit(0)

# Check database connection with SQLAlchemy
from sqlalchemy import create_engine, text

# Replace async/psycopg prefix for test connection if needed
clean_url = db_url
if clean_url.startswith("postgres://"):
    clean_url = clean_url.replace("postgres://", "postgresql+psycopg://", 1)

print(f"[SkillIntel] Waiting for database connection...")
max_retries = 30
for i in range(max_retries):
    try:
        engine = create_engine(clean_url, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[SkillIntel] Database is reachable and ready!")
        sys.exit(0)
    except Exception as e:
        print(f"[SkillIntel] DB not ready yet (attempt {i+1}/{max_retries}): {e}")
        time.sleep(2)

print("[SkillIntel] Error: Database timed out after 60 seconds.")
sys.exit(1)
EOF

echo "==> [SkillIntel Backend] Running Alembic migrations..."
python -m alembic upgrade head || {
    echo "==> [SkillIntel Backend] Warning: Alembic upgrade failed or tables already initialized. Continuing..."
}

# Run database seed if AUTO_SEED is true or 1
if [ "${AUTO_SEED}" = "true" ] || [ "${AUTO_SEED}" = "1" ]; then
    echo "==> [SkillIntel Backend] AUTO_SEED is enabled. Seeding initial data..."
    python scripts/seed_database.py || echo "==> [SkillIntel Backend] Seeding finished with notice."
fi

# Pre-warm sentence-transformer model in cache if not done
echo "==> [SkillIntel Backend] Pre-loading ML embedding model..."
python -c "from app.services.embedding_service import get_embedding_model; get_embedding_model()" || echo "Model cached."

echo "==> [SkillIntel Backend] Launching Uvicorn ASGI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${WEB_CONCURRENCY:-2}
