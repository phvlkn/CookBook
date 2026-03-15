from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth import get_current_user
from backend.app.crud import (
    add_recipe_to_collection,
    create_collection,
    create_shopping_list,
    get_user_shopping_lists,
)
from backend.app.database import Collection, User, get_db
from backend.app.schemas import (
    CollectionCreate,
    CollectionResponse,
    ShoppingListCreate,
    ShoppingListResponse,
)


router = APIRouter(tags=["Collections"])
shopping_router = APIRouter(prefix="/api", tags=["ShoppingLists"])


@router.post("/api/collections", response_model=CollectionResponse, summary="Create collection")
def create_collection_endpoint(
    collection: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_collection(db, current_user.id, collection)


@router.post("/api/collections/{collection_id}/recipes", summary="Add recipe to collection")
def add_to_collection(
    collection_id: int,
    recipe_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    if collection.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет прав на изменение коллекции")

    return add_recipe_to_collection(db, collection_id, recipe_id)


@shopping_router.post("/shopping-lists", response_model=ShoppingListResponse, summary="Create shopping list")
def create_shopping_list_endpoint(
    data: ShoppingListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_shopping_list(db, current_user.id, data)


@shopping_router.get("/users/{user_id}/shopping-lists", response_model=list[ShoppingListResponse], summary="Get user's shopping lists")
def user_shopping_lists(user_id: int, db: Session = Depends(get_db)):
    return get_user_shopping_lists(db, user_id)
