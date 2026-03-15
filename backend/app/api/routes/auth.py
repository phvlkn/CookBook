import os
from datetime import timedelta

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.app.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    get_current_user,
)
from backend.app.crud import create_user
from backend.app.database import User, get_db
from backend.app.schemas import Token, UserCreate, UserLogin, UserResponse
from backend.app.services.file_service import save_uploaded_file


router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/token", response_model=Token, summary="Get access token")
async def login_for_access_token(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse, summary="Register user")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user_data)


@router.get("/me", response_model=UserResponse, summary="Get current user")
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/uploads/avatar", summary="Upload avatar")
def upload_avatar(avatar: UploadFile = File(...)):
    static_root = os.path.join(os.path.dirname(__file__), "..", "..", "..", "static")
    url = save_uploaded_file(avatar, os.path.abspath(static_root), subfolder="avatars")
    return {"url": url}
