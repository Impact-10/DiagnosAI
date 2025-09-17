import json
from sqlalchemy.future import select
from app.models.user import User
from app.models.diagnosis import Diagnosis
from app.db.session import async_session
from app.models.sessions import Session, Message


async def get_user_by_email(email: str):
    async with async_session() as session:
        result = await session.execute(select(User).filter(User.email == email))
        return result.scalars().first()


async def create_user(email: str, hashed_password: str):
    async with async_session() as session:
        user = User(email=email, hashed_password=hashed_password)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def create_diagnosis_record(user_id: int, prompt: str, diagnosis):
    diagnosis_str = json.dumps(diagnosis) if isinstance(diagnosis, dict) else diagnosis
    async with async_session() as session:
        record = Diagnosis(user_id=user_id, prompt=prompt, diagnosis=diagnosis_str)
        session.add(record)
        await session.commit()
        await session.refresh(record)
        return record


async def get_diagnosis_record(record_id: int):
    async with async_session() as session:
        result = await session.execute(select(Diagnosis).filter(Diagnosis.id == record_id))
        return result.scalars().first()


# Session CRUD

async def create_session(user_id: int) -> Session:
    async with async_session() as session:
        s = Session(user_id=user_id)
        session.add(s)
        await session.commit()
        await session.refresh(s)
        return s


async def add_message(session_id: int, role: str, content: str):
    async with async_session() as session:
        msg = Message(session_id=session_id, role=role, content=content)
        session.add(msg)
        await session.commit()
        await session.refresh(msg)
        return msg


async def get_session_messages(session_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(Message).filter(Message.session_id == session_id).order_by(Message.created_at)
        )
        return result.scalars().all()


async def get_session(session_id: int) -> Session:
    async with async_session() as session:
        result = await session.execute(
            select(Session).filter(Session.id == session_id)
        )
        return result.scalars().first()
