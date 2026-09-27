# Геймификация для ВСМ — тренажёр проводника

Интерактивное обучающее приложение для проводников ВСМ-400. Нелинейные
диалоговые сценарии, заземлённые в стандартах **СТО РЖД 03.011 / 03.013 /
03.014** и справочнике «Ситуации на борту». Две живые шкалы — лояльность
пассажира и рейтинг безопасности — плюс таймеры на решения, XP, уровни,
достижения и таблица лидеров.

## Стек

| Слой     | Технологии                                                         |
| -------- | ------------------------------------------------------------------ |
| Бэкенд   | FastAPI · SQLAlchemy 2.0 · Alembic · PostgreSQL 15                 |
| Кэш      | Valkey 7 (совместим с Redis)                                       |
| Фронтенд | Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · Phosphor Icons |
| Инфра    | Docker Compose (профили dev и prod) · Traefik                      |

## Быстрый старт

### Прод — одна команда

```bash
cp .env.example .env
docker compose --profile prod up -d --build
```

Всё. При каждом старте контейнера `main-service` автоматически:

1. дожидается готовности PostgreSQL (healthcheck + retry loop),
2. выполняет `alembic upgrade head`,
3. засеивает сценарии и достижения (`python -m scripts.seed_game`),
4. засеивает демо-пользователя (`python -m scripts.seed_demo_user`),
5. запускает uvicorn.

Адреса:

- Веб-приложение — http://localhost:3000
- API / Swagger — http://localhost:8000/docs
- Через Traefik — http://localhost/api/v1/... (порт 80)

Демо-доступ:

```
test@example.com / Test12345!
```

### Разработка — бэкенд в Docker, фронтенд локально

Поднимаем бэкенд:

```bash
cp .env.example .env
docker compose --profile dev up -d --build
```

Затем запускаем фронтенд на хосте:

```bash
cd website
npm install
npm run dev
```

Фронтенд доступен на http://localhost:3000 и общается с бэкендом по
http://localhost:8000 через rewrite-прокси Next.js. Hot reload работает
как обычно.

Миграции и сиды выполняются при каждом старте `main-service`, руками
запускать ничего не нужно.

### Полезные команды

```bash
docker compose --profile dev logs -f main-service   # смотреть логи бэкенда
docker compose --profile dev restart main-service   # перезапустить с миграциями и сидами
docker compose --profile prod down                  # остановить всё
docker compose --profile prod down -v               # остановить и стереть БД
```

## Что поднимает каждый профиль

| Профиль | main-db | valkey | main-service | website | traefik |
| ------- | ------- | ------ | ------------ | ------- | ------- |
| `dev`   | да      | да     | да           | —       | да      |
| `prod`  | да      | да     | да           | да      | да      |

`dev` — только бэкенд: фронтенд быстрее гонять локально через `npm run dev`.
`prod` — полный стек, включая собранный Next.js в контейнере.

## Структура проекта

```
.
├── backend/
│   ├── docker-compose.yml          # main-db, valkey, main-service (профили: dev, prod)
│   ├── docker-compose.web.yml      # website (профиль: prod)
│   └── services/main-service/
│       ├── Dockerfile
│       ├── entrypoint.sh           # миграции -> сиды -> uvicorn
│       ├── alembic/                # миграции
│       ├── app/
│       │   ├── api/v1/             # auth, admin, me, game
│       │   ├── models/             # SQLAlchemy-модели
│       │   ├── schemas/            # Pydantic-схемы
│       │   ├── services/           # scenario_engine, gamification, otp, email
│       │   └── data/scenarios/     # JSON-описания сценариев
│       └── scripts/                # seed_game, seed_demo_user
├── website/                        # Next.js
├── scripts/
│   └── smoke_test.sh               # e2e-проверка API
├── docker-compose.yml              # корневой: включает backend + web, добавляет traefik
└── .env.example
```

## API

FastAPI сам публикует документацию на http://localhost:8000/docs (Swagger UI).
Ключевые эндпоинты под `/api/v1/game`:

| Метод | Путь                      | Назначение                            |
| ----- | ------------------------- | ------------------------------------- |
| GET   | `/scenarios`              | список активных сценариев             |
| POST  | `/scenarios/{slug}/start` | начать прохождение                    |
| POST  | `/runs/{run_id}/choose`   | отправить выбор                       |
| GET   | `/runs/{run_id}/report`   | полный разбор после прохождения       |
| GET   | `/me`                     | профиль игрока (XP, уровень, средние) |
| GET   | `/leaderboard`            | рейтинг по XP                         |

## Как добавить сценарий

Сценарии — это обычные JSON-файлы в
`backend/services/main-service/app/data/scenarios/`. Каждый файл содержит:

- мета: `slug`, `category`, `service_class`, `passenger_type`, `regulatory_ref`,
- граф узлов: `key`, `type`, `text`, `timer_seconds`, `is_terminal`,
- варианты выбора с `loyalty_delta`, `safety_delta`, `score_delta`,
  `role_step` и опциональным `requires_escalation`.

Кладёшь новый JSON в эту папку и перезапускаешь сервис:

```bash
docker compose restart main-service
```

Entrypoint сам перезапустит seed-скрипт и подхватит файл.

## Smoke-тест

Когда стек поднят:

```bash
./scripts/smoke_test.sh
```

Скрипт логинится демо-пользователем, запрашивает список сценариев, стартует
прогон, делает выбор и забирает отчёт — быстрая end-to-end проверка API.

## Данные и соответствие требованиям

- Реальных ПДН нет. Сценарии, имена пассажиров и диалоги — синтетические.
- Секреты лежат только в `.env` (см. `.env.example`). В репозитории ключей нет.
- Пароли хэшируются bcrypt; JWT-секрет — на каждое развёртывание свой.

## Лицензия

Apache-2.0. См. `LICENSE`.
