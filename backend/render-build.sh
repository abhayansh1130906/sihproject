#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing remaining dependencies..."
python -m pip install --no-cache-dir -r requirements.txt

echo "==> Applying database migrations..."
python -m alembic upgrade head

echo "==> Build complete!"
