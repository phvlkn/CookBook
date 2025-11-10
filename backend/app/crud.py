# backend/app/crud.py

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from passlib.hash import pbkdf2_sha256
from typing import List

# АБСОЛЮТНЫЕ ИМПОРТЫ
from database import (
    User, Recipe, Ingredient, Review, Collection, ShoppingList, 
    RecipeIngredients, CollectionRecipes
)
import schemas


# ---------- USER ----------

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pbkdf2_sha256.hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


# ---------- INGREDIENTS ----------

def get_or_create_ingredient(db: Session, name: str, unit: str = "г"):
    ingredient = db.query(Ingredient).filter(Ingredient.name == name).first()
    if ingredient:
        return ingredient
    ingredient = Ingredient(name=name, default_unit=unit)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


# ---------- RECIPES ----------

def create_recipe(db: Session, recipe: schemas.RecipeCreate, author_id: int):
    db_recipe = Recipe(
        title=recipe.title,
        description=recipe.description,
        cook_time=recipe.cook_time,
        category=recipe.category,
        diet=recipe.diet,
        cuisine=recipe.cuisine,
        steps=[step.dict() for step in recipe.steps],
        image=recipe.image,
        author_id=author_id,
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    # Добавление ингредиентов
    for item in recipe.ingredients:
        ingredient = get_or_create_ingredient(db, item.name, item.unit)
        db.execute(
            RecipeIngredients.insert().values(
                recipe_id=db_recipe.id,
                ingredient_id=ingredient.id,
                quantity=item.quantity,
                unit=item.unit,
            )
        )
    db.commit()
    return db_recipe


def get_all_recipes(db: Session, skip: int = 0, limit: int = 50):
    return db.query(Recipe).offset(skip).limit(limit).all()


def get_recipe_by_id(db: Session, recipe_id: int):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    return recipe


def delete_recipe(db: Session, recipe_id: int, user_id: int):
    recipe = get_recipe_by_id(db, recipe_id)
    if recipe.author_id != user_id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление рецепта")
    db.delete(recipe)
    db.commit()
    return {"message": "Рецепт удалён"}


# ---------- REVIEWS ----------

def create_review(db: Session, recipe_id: int, user_id: int, review: schemas.ReviewCreate):
    existing = (
        db.query(Review)
        .filter(Review.recipe_id == recipe_id, Review.user_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Отзыв уже оставлен")

    db_review = Review(
        recipe_id=recipe_id,
        user_id=user_id,
        rating=review.rating,
        comment=review.comment,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_reviews_for_recipe(db: Session, recipe_id: int):
    return db.query(Review).filter(Review.recipe_id == recipe_id).all()


# ---------- COLLECTIONS ----------

def create_collection(db: Session, user_id: int, collection: schemas.CollectionCreate):
    db_collection = Collection(
        user_id=user_id,
        title=collection.title,
        description=collection.description,
        is_public=collection.is_public,
    )
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    return db_collection


def add_recipe_to_collection(db: Session, collection_id: int, recipe_id: int):
    db.execute(
        CollectionRecipes.insert().values(
            collection_id=collection_id,
            recipe_id=recipe_id
        )
    )
    db.commit()
    return {"message": "Рецепт добавлен в коллекцию"}


# ---------- SHOPPING LISTS ----------

def create_shopping_list(db: Session, user_id: int, data: schemas.ShoppingListCreate):
    db_list = ShoppingList(
        user_id=user_id,
        title=data.title,
        recipes=data.recipes,
        items=[item.dict() for item in data.items],
    )
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list


def get_user_shopping_lists(db: Session, user_id: int):
    return db.query(ShoppingList).filter(ShoppingList.user_id == user_id).all()