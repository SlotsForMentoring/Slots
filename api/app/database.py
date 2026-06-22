import logging
from pathlib import Path

import asyncpg
from fastapi import Request

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"


async def get_db_pool(request: Request) -> asyncpg.Pool:
    return request.app.state.pool


async def run_migrations(pool: asyncpg.Pool) -> None:
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    applied = 0

    for path in migration_files:
        version = path.name
        async with pool.acquire() as conn:
            exists = await conn.fetchval(
                "SELECT version FROM schema_migrations WHERE version = $1",
                version,
            )
            if exists:
                logger.info("Skipping migration %s (already applied)", version)
                continue

            sql = path.read_text()
            try:
                async with conn.transaction():
                    await conn.execute(sql)
                    await conn.execute(
                        "INSERT INTO schema_migrations (version) VALUES ($1)",
                        version,
                    )
                logger.info("Applied migration %s", version)
                applied += 1
            except Exception as exc:
                logger.error("Failed to apply migration %s: %s", version, exc)
                raise

    logger.info("Migration complete. %d new migration(s) applied.", applied)
