from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from app.api.router import router
from config.rate_limiter import global_rate_limit
from config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)
logger.info("Starting main service")

app = FastAPI(title="Main Service", version="1.0.0", root_path="/api")

# CORS
# ALLOWED_ORIGINS may be empty in dev. Splitting "" yields [""], which
# matches no browser origin and makes every preflight fail with 400.
# Fall back to a sane dev default instead.
_raw = os.getenv("ALLOWED_ORIGINS", "") or ""
origins = [o.strip() for o in _raw.split(",") if o.strip()]
if not origins:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
    ]
logger.info("CORS allowed origins: %s", origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(global_rate_limit)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "main-service"}
