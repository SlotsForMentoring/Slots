import asyncio
import logging
import os

import asyncpg
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


async def main() -> None:
    from app.database import run_migrations

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in your .env file")

    pool = await asyncpg.create_pool(database_url)
    try:
        await run_migrations(pool)
    finally:
        await pool.close()


if __name__ == "__main__":
    asyncio.run(main())
