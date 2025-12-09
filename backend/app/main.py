import logging
from datetime import timedelta
from fastapi import FastAPI, HTTPException, status, Depends, Body, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from database import init_db, get_db
from auth import authenticate_user, create_access_token
from auth import get_current_user, oauth2_scheme
from fastapi.staticfiles import StaticFiles
import os
import uuid
import json
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
    search_recipes,
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
    get_recipes_by_user,
)
from database import Collection

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s")
app = FastAPI(title="CookBook API")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logging.info(f"Received {request.method} {request.url}")
    response = await call_next(request)
    logging.info(f"Responded {response.status_code} to {request.method} {request.url}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount static directory so images are served at /static/
static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
os.makedirs(os.path.join(static_dir, 'images'), exist_ok=True)
os.makedirs(os.path.join(static_dir, 'avatars'), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


def save_upload_file(upload: UploadFile, subfolder: str = "images") -> str:
    ext = os.path.splitext(upload.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    folder = os.path.join(static_dir, subfolder)
    os.makedirs(folder, exist_ok=True)
    destination = os.path.join(folder, filename)
    with open(destination, "wb") as f:
        f.write(upload.file.read())
    return f"/static/{subfolder}/{filename}"

@app.get("/api/recipes")
async def read_recipes():
    return {"message": "CookBook API is running"}


@app.get("/api/recipes/all", response_model=List[RecipeResponse], tags=["Recipes"], summary="List recipes (paginated)")
def list_recipes(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Return a paginated list of recipes"""
    return get_all_recipes(db, skip=skip, limit=limit)


@app.get("/api/recipes/search", response_model=List[RecipeResponse], tags=["Recipes"], summary="Search recipes")
def search_recipes_endpoint(q: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Search recipes by query string across title/description/category/cuisine and ingredients."""
    return search_recipes(db, q=q, skip=skip, limit=limit)


@app.post("/api/recipes", response_model=RecipeResponse, tags=["Recipes"], summary="Create recipe (JSON)")
def create_recipe_endpoint(recipe: RecipeCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Create a new recipe. Author is taken from the authenticated user."""
    return create_recipe(db, recipe, current_user.id)


@app.post("/api/recipes/upload", response_model=RecipeResponse)
def upload_recipe(
    recipe_json: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create recipe via multipart/form-data. "recipe_json" is JSON string matching RecipeCreate."""
    # parse recipe JSON
    try:
        recipe_data = json.loads(recipe_json)
        # validate using Pydantic by creating RecipeCreate
        recipe_obj = RecipeCreate(**recipe_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid recipe JSON: {e}")

    # handle image if provided
    if image:
        recipe_obj.image = save_upload_file(image, subfolder="images")

    return create_recipe(db, recipe_obj, current_user.id)


@app.get("/api/recipes/{recipe_id}", response_model=RecipeResponse, tags=["Recipes"], summary="Get recipe by id")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    return get_recipe_by_id(db, recipe_id)


@app.delete("/api/recipes/{recipe_id}", tags=["Recipes"], summary="Delete recipe (owner only)")
def remove_recipe(recipe_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Delete a recipe. Only the author (owner) may delete."""
    return delete_recipe(db, recipe_id, current_user.id)


@app.post("/api/recipes/{recipe_id}/reviews", response_model=ReviewResponse, tags=["Reviews"], summary="Create review (authenticated)")
def post_review(recipe_id: int, review: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_review(db, recipe_id, current_user.id, review)


@app.get("/api/recipes/{recipe_id}/reviews", response_model=List[ReviewResponse], tags=["Reviews"], summary="List reviews for a recipe")
def list_reviews(recipe_id: int, db: Session = Depends(get_db)):
    return get_reviews_for_recipe(db, recipe_id)


@app.post("/api/collections", response_model=CollectionResponse, tags=["Collections"], summary="Create collection (authenticated)")
def create_collection_endpoint(collection: CollectionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_collection(db, current_user.id, collection)


@app.post("/api/collections/{collection_id}/recipes", tags=["Collections"], summary="Add recipe to collection (owner only)")
def add_to_collection(collection_id: int, recipe_id: int = Body(..., embed=True), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Add a recipe to a collection. Only collection owner may modify their collection."""
    coll = db.query(Collection).filter(Collection.id == collection_id).first()
    if not coll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    if coll.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет прав на изменение коллекции")
    return add_recipe_to_collection(db, collection_id, recipe_id)


@app.post("/api/shopping-lists", response_model=ShoppingListResponse, tags=["ShoppingLists"], summary="Create shopping list (authenticated)")
def create_shopping_list_endpoint(data: ShoppingListCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_shopping_list(db, current_user.id, data)


@app.get("/api/users/{user_id}/shopping-lists", response_model=List[ShoppingListResponse], tags=["ShoppingLists"], summary="Get user's shopping lists")
def user_shopping_lists(user_id: int, db: Session = Depends(get_db)):
    return get_user_shopping_lists(db, user_id)


@app.get("/api/users/{user_id}", response_model=UserResponse, tags=["Users"], summary="Get user by id")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user


@app.get("/api/users/{user_id}/recipes", response_model=List[RecipeResponse], tags=["Users"], summary="List recipes by user")
def get_user_recipes(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return get_recipes_by_user(db, user_id, skip=skip, limit=limit)

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


@app.get("/api/auth/me", response_model=UserResponse)
def read_current_user(current_user=Depends(get_current_user)):
    return current_user


@app.post("/api/uploads/avatar")
def upload_avatar(avatar: UploadFile = File(...)):
    url = save_upload_file(avatar, subfolder="avatars")
    return {"url": url}

if __name__ == "__main__":
    import uvicorn
    init_db()
    # seed DB with initial data
    try:
        from seed_data import create_seed_data
        create_seed_data()
    except Exception as e:
        print(f"Seeding failed: {e}")
    uvicorn.run(app, host="0.0.0.0", port=8000)