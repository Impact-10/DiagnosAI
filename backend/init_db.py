import asyncio
from app.db.session import engine
from app.db.base import Base

# Import ALL your model classes here so they register with Base.metadata
from app.models.user import User
from app.models.diagnosis import Diagnosis
from app.models.sessions import Session, Message  # import new models here


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")

if __name__ == "__main__":
    asyncio.run(init_db())
