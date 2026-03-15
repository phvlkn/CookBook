from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.crud import get_recipes_by_user, get_user_by_id
from backend.app.database import get_db
from backend.app.schemas import RecipeResponse, UserResponse


router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by id")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user


@router.get("/{user_id}/recipes", response_model=list[RecipeResponse], summary="List recipes by user")
def get_user_recipes(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return get_recipes_by_user(db, user_id, skip=skip, limit=limit)
