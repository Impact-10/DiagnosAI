import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.db.crud import get_user_by_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/token")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "yoursecretkey")
ALGORITHM = "HS256"


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        user = await get_user_by_email(email)
        if not user:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user
