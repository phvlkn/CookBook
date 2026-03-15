from typing import Iterable

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import backend.app.schemas as schemas
from backend.app.auth import hash_password
from backend.app.database import (
    Collection,
    CollectionRecipes,
    Ingredient,
    Recipe,
    RecipeIngredients,
    Review,
    ShoppingList,
    User,
)


def create_user(db: Session, user: schemas.UserCreate):
    db_user = User(
        email=user.email,
        username=user.username,
        password_hash=hash_password(user.password),
        bio=user.bio,
        avatar=user.avatar,
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован") from error


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_or_create_ingredient(db: Session, name: str, unit: str = "г"):
    ingredient = db.query(Ingredient).filter(Ingredient.name == name).first()
    if ingredient:
        return ingredient

    ingredient = Ingredient(name=name, default_unit=unit)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


def _get_recipe_entity_or_404(db: Session, recipe_id: int) -> Recipe:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    return recipe


def _get_collection_entity_or_404(db: Session, collection_id: int) -> Collection:
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    return collection


def _build_recipe_ingredients_map(db: Session, recipe_ids: Iterable[int]) -> dict[int, list[dict]]:
    recipe_ids = list(recipe_ids)
    if not recipe_ids:
        return {}

    # Load all ingredients for the selected recipes in one query to avoid N+1 lookups.
    stmt = (
        select(
            RecipeIngredients.c.recipe_id,
            RecipeIngredients.c.quantity,
            RecipeIngredients.c.unit,
            Ingredient.name,
            Ingredient.default_unit,
        )
        .join(Ingredient, Ingredient.id == RecipeIngredients.c.ingredient_id)
        .where(RecipeIngredients.c.recipe_id.in_(recipe_ids))
        .order_by(RecipeIngredients.c.recipe_id, Ingredient.name)
    )
    rows = db.execute(stmt).mappings().all()

    ingredients_map: dict[int, list[dict]] = {}
    for row in rows:
        ingredients_map.setdefault(row["recipe_id"], []).append(
            {
                "name": row["name"],
                "quantity": float(row["quantity"]),
                "unit": row["unit"] or row["default_unit"] or "г",
            }
        )
    return ingredients_map


def serialize_recipe(recipe: Recipe, ingredients_map: dict[int, list[dict]] | None = None):
    recipe_ingredients = ingredients_map.get(recipe.id, []) if ingredients_map else []
    return {
        "id": recipe.id,
        "author_id": recipe.author_id,
        "title": recipe.title,
        "description": recipe.description,
        "cook_time": recipe.cook_time,
        "category": recipe.category,
        "diet": recipe.diet,
        "cuisine": recipe.cuisine,
        "steps": recipe.steps,
        "ingredients": recipe_ingredients,
        "image": recipe.image,
        "rating_avg": recipe.rating_avg,
        "created_at": recipe.created_at,
    }


def serialize_recipe_list(db: Session, recipes: list[Recipe]):
    ingredients_map = _build_recipe_ingredients_map(db, [recipe.id for recipe in recipes])
    return [serialize_recipe(recipe, ingredients_map) for recipe in recipes]


def create_recipe(db: Session, recipe: schemas.RecipeCreate, author_id: int):
    db_recipe = Recipe(
        title=recipe.title,
        description=recipe.description,
        cook_time=recipe.cook_time,
        category=recipe.category,
        diet=recipe.diet,
        cuisine=recipe.cuisine,
        steps=[step.model_dump() for step in recipe.steps],
        image=recipe.image,
        author_id=author_id,
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

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

    return serialize_recipe_list(db, [db_recipe])[0]


def get_all_recipes(db: Session, skip: int = 0, limit: int = 50):
    recipes = db.query(Recipe).order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()
    return serialize_recipe_list(db, recipes)


def get_recipes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    recipes = (
        db.query(Recipe)
        .filter(Recipe.author_id == user_id)
        .order_by(Recipe.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return serialize_recipe_list(db, recipes)


def search_recipes(db: Session, q: str, skip: int = 0, limit: int = 50):
    if not q:
        return get_all_recipes(db, skip=skip, limit=limit)

    pattern = f"%{q.strip()}%"
    recipes = (
        db.query(Recipe)
        .outerjoin(RecipeIngredients, Recipe.id == RecipeIngredients.c.recipe_id)
        .outerjoin(Ingredient, Ingredient.id == RecipeIngredients.c.ingredient_id)
        .filter(
            or_(
                Recipe.title.ilike(pattern),
                Recipe.description.ilike(pattern),
                Recipe.category.ilike(pattern),
                Recipe.cuisine.ilike(pattern),
                Ingredient.name.ilike(pattern),
            )
        )
        .distinct()
        .order_by(Recipe.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return serialize_recipe_list(db, recipes)


def get_recipe_by_id(db: Session, recipe_id: int):
    recipe = _get_recipe_entity_or_404(db, recipe_id)
    return serialize_recipe_list(db, [recipe])[0]


def delete_recipe(db: Session, recipe_id: int, user_id: int):
    recipe = _get_recipe_entity_or_404(db, recipe_id)
    if recipe.author_id != user_id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление рецепта")

    db.delete(recipe)
    db.commit()
    return {"message": "Рецепт удалён"}


def create_review(db: Session, recipe_id: int, user_id: int, review: schemas.ReviewCreate):
    _get_recipe_entity_or_404(db, recipe_id)
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

    # Keep the denormalized rating value in sync after each new review.
    rating_avg = (
        db.query(func.avg(Review.rating))
        .filter(Review.recipe_id == recipe_id)
        .scalar()
    )
    recipe = _get_recipe_entity_or_404(db, recipe_id)
    recipe.rating_avg = float(rating_avg or 0)
    db.commit()

    return db_review


def get_reviews_for_recipe(db: Session, recipe_id: int):
    _get_recipe_entity_or_404(db, recipe_id)
    return (
        db.query(Review)
        .filter(Review.recipe_id == recipe_id)
        .order_by(Review.created_at.desc())
        .all()
    )


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
    _get_collection_entity_or_404(db, collection_id)
    _get_recipe_entity_or_404(db, recipe_id)

    exists = db.execute(
        select(CollectionRecipes.c.id).where(
            CollectionRecipes.c.collection_id == collection_id,
            CollectionRecipes.c.recipe_id == recipe_id,
        )
    ).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Рецепт уже добавлен в коллекцию",
        )

    db.execute(
        CollectionRecipes.insert().values(
            collection_id=collection_id,
            recipe_id=recipe_id,
        )
    )
    db.commit()
    return {"message": "Рецепт добавлен в коллекцию"}


def create_shopping_list(db: Session, user_id: int, data: schemas.ShoppingListCreate):
    missing_recipe = (
        db.query(Recipe)
        .filter(Recipe.id.in_(data.recipes))
        .count()
    )
    if data.recipes and missing_recipe != len(set(data.recipes)):
        raise HTTPException(status_code=404, detail="Один или несколько рецептов не найдены")

    db_list = ShoppingList(
        user_id=user_id,
        title=data.title,
        recipes=data.recipes,
        items=[item.model_dump() for item in data.items],
    )
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list


def get_user_shopping_lists(db: Session, user_id: int):
    return (
        db.query(ShoppingList)
        .filter(ShoppingList.user_id == user_id)
        .order_by(ShoppingList.created_at.desc())
        .all()
    )
