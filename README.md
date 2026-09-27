# VSM Gamification — Conductor Trainer

Interactive training app for VSM-400 high-speed rail conductors. Non-linear
dialogue scenarios grounded in RZD standards **СТО РЖД 03.011 / 03.013 / 03.014**
and the *"On-board situations"* handbook. Two live scales — passenger loyalty
and safety rating — plus decision timers, XP, levels, achievements and a
leaderboard.

## Stack

| Layer    | Tech                                                               |
| -------- | ------------------------------------------------------------------ |
| Backend  | FastAPI · SQLAlchemy 2.0 · Alembic · PostgreSQL 15                 |
| Cache    | Valkey 7 (Redis-compatible)                                        |
| Frontend | Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · Phosphor Icons |
| Infra    | Docker Compose (dev + prod profiles) · Traefik                     |

## Quick start

### Production — one command

```bash
cp .env.example .env
docker compose --profile prod up -d --build
```

That is it. On every container start, `main-service` automatically:

1. waits for PostgreSQL (healthcheck + retry loop),
2. runs `alembic upgrade head`,
3. seeds scenarios and achievements (`python -m scripts.seed_game`),
4. seeds the demo login (`python -m scripts.seed_demo_user`),
5. starts uvicorn.

URLs:

- Web app — http://localhost:3000
- API / Swagger — http://localhost:8000/docs
- Through Traefik — http://localhost/api/v1/... (port 80)

Demo login:

```
test@example.com / Test12345!
```

### Development — backend in Docker, frontend on host

Start the backend stack:

```bash
cp .env.example .env
docker compose --profile dev up -d --build
```

Then run the frontend from the host:

```bash
cd website
npm install
npm run dev
```

Frontend is now at http://localhost:3000, talking to the backend at
http://localhost:8000 (Next.js rewrite proxy). Hot reload works as usual.

Migrations and seeds run on every `main-service` start, so you never need
to run them by hand.

### Useful commands

```bash
docker compose --profile dev logs -f main-service   # tail backend logs
docker compose --profile dev restart main-service   # re-run migrations + seeds
docker compose --profile prod down                  # stop everything
docker compose --profile prod down -v               # stop + wipe the DB volume
```

## What each profile starts

| Profile | main-db | valkey | main-service | website | traefik |
| ------- | ------- | ------ | ------------ | ------- | ------- |
| `dev`   | yes     | yes    | yes          | —       | yes     |
| `prod`  | yes     | yes    | yes          | yes     | yes     |

`dev` is backend-only, because the frontend runs faster with `npm run dev`
on the host. `prod` runs the full stack including the built Next.js container.

## Project structure

```
.
├── backend/
│   ├── docker-compose.yml          # main-db, valkey, main-service (profiles: dev, prod)
│   ├── docker-compose.web.yml      # website (profile: prod)
│   └── services/main-service/
│       ├── Dockerfile
│       ├── entrypoint.sh           # migrate -> seed -> uvicorn
│       ├── alembic/                # migrations
│       ├── app/
│       │   ├── api/v1/             # auth, admin, me, game
│       │   ├── models/             # SQLAlchemy models
│       │   ├── schemas/            # Pydantic
│       │   ├── services/           # scenario_engine, gamification, otp, email
│       │   └── data/scenarios/     # JSON scenario definitions
│       └── scripts/                # seed_game, seed_demo_user
├── website/                        # Next.js app
├── scripts/
│   └── smoke_test.sh               # end-to-end API smoke test
├── docker-compose.yml              # root: includes backend + web, adds traefik
└── .env.example
```

## API

FastAPI auto-documents everything at http://localhost:8000/docs (Swagger UI).
Key endpoints under `/api/v1/game`:

| Method | Path                      | Purpose                              |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/scenarios`              | list active scenarios                |
| POST   | `/scenarios/{slug}/start` | begin a run                          |
| POST   | `/runs/{run_id}/choose`   | submit a choice                      |
| GET    | `/runs/{run_id}/report`   | full breakdown after the run         |
| GET    | `/me`                     | player profile (XP, level, averages) |
| GET    | `/leaderboard`            | ranking by XP                        |

## Adding a scenario

Scenarios are plain JSON files under
`backend/services/main-service/app/data/scenarios/`. Each file defines:

- meta: `slug`, `category`, `service_class`, `passenger_type`, `regulatory_ref`,
- a graph of nodes: `key`, `type`, `text`, `timer_seconds`, `is_terminal`,
- per-node choices with `loyalty_delta`, `safety_delta`, `score_delta`,
  `role_step`, optional `requires_escalation`.

Drop a new JSON file into that folder and restart the service:

```bash
docker compose restart main-service
```

The entrypoint re-runs the seed script on start, picks up the new file.

## Smoke test

With the stack up:

```bash
./scripts/smoke_test.sh
```

It logs in as the demo user, lists scenarios, starts a run, makes a choice
and fetches the report — a quick end-to-end sanity check of the API.

## Data and compliance

- No real PII. Scenarios, passenger names and dialogue are synthetic.
- Secrets live only in `.env` (see `.env.example`). The repo ships no keys.
- Passwords are hashed with bcrypt; JWT secrets are per-deployment.

## License

Apache-2.0. See `LICENSE`.
