from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


# ---------- USER ----------

class UserBase(BaseModel):
    email: EmailStr
    username: str
    bio: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    date_joined: datetime
    is_active: bool = True

    class Config:
        orm_mode = True


# ---------- AUTH ----------

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ---------- INGREDIENT ----------

class IngredientBase(BaseModel):
    name: str
    default_unit: Optional[str] = "г"


class IngredientCreate(IngredientBase):
    pass


class IngredientResponse(IngredientBase):
    id: int

    class Config:
        orm_mode = True


# ---------- RECIPE ----------

class RecipeStep(BaseModel):
    order: int
    text: str


class RecipeIngredientItem(BaseModel):
    name: str
    quantity: float
    unit: str


class RecipeBase(BaseModel):
    title: str
    description: str
    cook_time: int
    category: str
    diet: Optional[str] = None
    cuisine: Optional[str] = None
    steps: List[RecipeStep]
    ingredients: List[RecipeIngredientItem]
    image: Optional[str] = None


class RecipeCreate(RecipeBase):
    pass


class RecipeResponse(RecipeBase):
    id: int
    author_id: int
    rating_avg: float
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- REVIEW ----------

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    recipe_id: int
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- COLLECTION ----------

class CollectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = True


class CollectionCreate(CollectionBase):
    pass


class CollectionResponse(CollectionBase):
    id: int
    user_id: int
    created_at: datetime
    recipes: Optional[List[RecipeResponse]] = None

    class Config:
        orm_mode = True


# ---------- SHOPPING LIST ----------

class ShoppingListItem(BaseModel):
    ingredient: str
    quantity: float
    unit: str


class ShoppingListBase(BaseModel):
    title: str
    recipes: List[int]
    items: List[ShoppingListItem]


class ShoppingListCreate(ShoppingListBase):
    pass


class ShoppingListResponse(ShoppingListBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str = None

class UserLogin(BaseModel):
    email: str
    password: str