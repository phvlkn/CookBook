import json
import os
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from backend.app.auth import get_current_user
from backend.app.crud import (
    create_recipe,
    create_review,
    delete_recipe,
    get_all_recipes,
    get_recipe_by_id,
    get_reviews_for_recipe,
    search_recipes,
)
from backend.app.database import User, get_db
from backend.app.schemas import (
    RecipeCreate,
    RecipeResponse,
    ReviewCreate,
    ReviewResponse,
)
from backend.app.services.file_service import save_recipe_image


router = APIRouter(prefix="/api/recipes", tags=["Recipes"])


@router.get("/", response_model=dict, summary="Recipes entrypoint")
async def read_recipes():
    return {"message": "CookBook API is running"}


@router.get("/all", response_model=List[RecipeResponse], summary="List recipes")
def list_recipes(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return get_all_recipes(db, skip=skip, limit=limit)


@router.get("/search", response_model=List[RecipeResponse], summary="Search recipes")
def search_recipes_endpoint(
    q: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return search_recipes(db, q=q, skip=skip, limit=limit)


@router.post("", response_model=RecipeResponse, summary="Create recipe (JSON)")
def create_recipe_endpoint(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_recipe(db, recipe, current_user.id)


@router.post("/upload", response_model=RecipeResponse, summary="Create recipe with image")
def upload_recipe(
    recipe_json: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe_data = json.loads(recipe_json)
    recipe_obj = RecipeCreate(**recipe_data)

    static_root = os.path.join(os.path.dirname(__file__), "..", "..", "..", "static")
    image_path = save_recipe_image(image, os.path.abspath(static_root))
    if image_path:
        recipe_obj.image = image_path

    return create_recipe(db, recipe_obj, current_user.id)


@router.get("/{recipe_id}", response_model=RecipeResponse, summary="Get recipe by id")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    return get_recipe_by_id(db, recipe_id)


@router.delete("/{recipe_id}", summary="Delete recipe")
def remove_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_recipe(db, recipe_id, current_user.id)


@router.post("/{recipe_id}/reviews", response_model=ReviewResponse, summary="Create review")
def post_review(
    recipe_id: int,
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_review(db, recipe_id, current_user.id, review)


@router.get("/{recipe_id}/reviews", response_model=List[ReviewResponse], summary="List reviews")
def list_reviews(recipe_id: int, db: Session = Depends(get_db)):
    return get_reviews_for_recipe(db, recipe_id)
