#!/bin/sh
# LLM context: container entrypoint. Idempotent — safe to run on every start.
# Order: migrations -> seeds -> server. Seeds never abort startup.
set -e

echo "[entrypoint] alembic upgrade head"
attempts=0
until alembic upgrade head; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 20 ]; then
    echo "[entrypoint] migration failed after $attempts attempts"
    exit 1
  fi
  echo "[entrypoint] db not ready, retry $attempts..."
  sleep 3
done

echo "[entrypoint] seed scenarios + achievements (idempotent)"
python -m scripts.seed_game || echo "[entrypoint] seed_game skipped"

echo "[entrypoint] seed demo user (idempotent)"
python -m scripts.seed_demo_user || echo "[entrypoint] seed_demo_user skipped"

echo "[entrypoint] starting uvicorn"
exec uvicorn main:app --reload --host 0.0.0.0 --port 8000
