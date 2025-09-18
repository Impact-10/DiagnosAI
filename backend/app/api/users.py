from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.db.crud import get_user_by_email, create_user
from jose import jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "yoursecretkey")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def hash_password(password: str):
    return pwd_context.hash(password)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    new_user = await create_user(user.email, hashed)
    return {"email": new_user.email}


@router.post("/token", response_model=TokenResponse)
async def login(user: UserCreate):
    db_user = await get_user_by_email(user.email)
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = jwt.encode({"sub": db_user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token}
