from fastapi import FastAPI, HTTPException, status, Depends, Body
from typing import List
from sqlalchemy.orm import Session
from database import init_db, get_db
from auth import authenticate_user, create_access_token
from schemas import (
    UserLogin,
    Token,
    UserCreate,
    UserResponse,
    RecipeCreate,
    RecipeResponse,
    ReviewCreate,
    ReviewResponse,
    CollectionCreate,
    CollectionResponse,
    ShoppingListCreate,
    ShoppingListResponse,
)
from crud import (
    create_user,
    create_recipe,
    get_all_recipes,
    get_recipe_by_id,
    delete_recipe,
    create_review,
    get_reviews_for_recipe,
    create_collection,
    add_recipe_to_collection,
    create_shopping_list,
    get_user_shopping_lists,
    get_user_by_id,
)
from datetime import timedelta

app = FastAPI(title="CookBook API")

@app.get("/api/recipes")
async def read_recipes():
    return {"message": "CookBook API is running"}


@app.get("/api/recipes/all", response_model=List[RecipeResponse])
def list_recipes(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Return a paginated list of recipes"""
    return get_all_recipes(db, skip=skip, limit=limit)


@app.post("/api/recipes", response_model=RecipeResponse)
def create_recipe_endpoint(
    recipe: RecipeCreate, author_id: int, db: Session = Depends(get_db)
):
    """Create a new recipe. Pass author_id as a query parameter for now."""
    return create_recipe(db, recipe, author_id)


@app.get("/api/recipes/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    return get_recipe_by_id(db, recipe_id)


@app.delete("/api/recipes/{recipe_id}")
def remove_recipe(recipe_id: int, user_id: int, db: Session = Depends(get_db)):
    """Delete a recipe. Requires user_id (owner) to be provided as query param."""
    return delete_recipe(db, recipe_id, user_id)


@app.post("/api/recipes/{recipe_id}/reviews", response_model=ReviewResponse)
def post_review(recipe_id: int, review: ReviewCreate, user_id: int, db: Session = Depends(get_db)):
    return create_review(db, recipe_id, user_id, review)


@app.get("/api/recipes/{recipe_id}/reviews", response_model=List[ReviewResponse])
def list_reviews(recipe_id: int, db: Session = Depends(get_db)):
    return get_reviews_for_recipe(db, recipe_id)


@app.post("/api/collections", response_model=CollectionResponse)
def create_collection_endpoint(collection: CollectionCreate, user_id: int, db: Session = Depends(get_db)):
    return create_collection(db, user_id, collection)


@app.post("/api/collections/{collection_id}/recipes")
def add_to_collection(collection_id: int, recipe_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    """Add a recipe to a collection. JSON body: {"recipe_id": <int>}"""
    return add_recipe_to_collection(db, collection_id, recipe_id)


@app.post("/api/shopping-lists", response_model=ShoppingListResponse)
def create_shopping_list_endpoint(data: ShoppingListCreate, user_id: int, db: Session = Depends(get_db)):
    return create_shopping_list(db, user_id, data)


@app.get("/api/users/{user_id}/shopping-lists", response_model=List[ShoppingListResponse])
def user_shopping_lists(user_id: int, db: Session = Depends(get_db)):
    return get_user_shopping_lists(db, user_id)


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user

@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user_data)

if __name__ == "__main__":
    import uvicorn
    init_db()
    # seed DB with initial data
    try:
        from seed_data import create_seed_data
        create_seed_data()
    except Exception as e:
        print(f"Seeding failed: {e}")
    uvicorn.run(app, host="127.0.0.1", port=8000)