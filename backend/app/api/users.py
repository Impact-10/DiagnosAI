from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.db import crud, session
from app.models.user import UserCreate, UserOut
from app.core.security import get_password_hash, verify_password
from app.core.dependencies import get_db

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=UserOut)
async def register_user(user: UserCreate, db=Depends(get_db)):
    db_user = await crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user.password = get_password_hash(user.password)
    created_user = await crud.create_user(db, user)
    return created_user

@router.post("/login")
async def login(user: UserLogin, db=Depends(get_db)):
    db_user = await crud.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Generate JWT Token here (not shown)
    return {"message": "Login successful", "token": "jwt-token-placeholder"}
