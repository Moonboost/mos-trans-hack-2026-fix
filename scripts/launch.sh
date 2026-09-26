#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[launch] created .env from .env.example"
fi

echo "[launch] building & starting backend stack..."
docker compose -f backend/docker-compose.yml up -d --build

echo "[launch] waiting for postgres..."
for i in $(seq 1 60); do
  if docker exec main-db pg_isready -q; then break; fi
  sleep 1
done

echo "[launch] waiting for main-service..."
for i in $(seq 1 60); do
  if docker exec main-service python -c "import urllib.request;urllib.request.urlopen('http://localhost:8000/health',timeout=2)" 2>/dev/null; then break; fi
  sleep 2
done

echo "[launch] seeding scenarios + demo user..."
docker exec main-service python -m scripts.seed_game
docker exec main-service python -m scripts.seed_demo_user

if [ "${1:-}" = "--web" ]; then
  echo "[launch] building web container (port 3000)..."
  docker compose -f backend/docker-compose.yml -f backend/docker-compose.web.yml --profile web up -d --build
  echo "[launch] web: http://localhost:3000"
else
  echo "[launch] web (manual): cd website && pnpm install && pnpm dev --port 3001"
fi

echo ""
echo "Demo credentials: test@example.com / Test12345!"
echo "Swagger: http://localhost:8000/docs"
