from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=2, max_length=100)
    bio: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date_joined: datetime
    is_active: bool = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class IngredientBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    default_unit: Optional[str] = "г"


class IngredientCreate(IngredientBase):
    pass


class IngredientResponse(IngredientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class RecipeStep(BaseModel):
    order: int = Field(ge=1)
    text: str = Field(min_length=3)


class RecipeIngredientItem(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)


class RecipeBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    cook_time: int = Field(gt=0, le=1440)
    category: str = Field(min_length=2, max_length=50)
    diet: Optional[str] = Field(default=None, max_length=50)
    cuisine: Optional[str] = Field(default=None, max_length=50)
    steps: List[RecipeStep]
    ingredients: List[RecipeIngredientItem]
    image: Optional[str] = None

    @field_validator("steps")
    @classmethod
    def validate_steps(cls, steps: List[RecipeStep]):
        if not steps:
            raise ValueError("Нужен хотя бы один шаг приготовления")
        return steps

    @field_validator("ingredients")
    @classmethod
    def validate_ingredients(cls, ingredients: List[RecipeIngredientItem]):
        if not ingredients:
            raise ValueError("Нужен хотя бы один ингредиент")
        return ingredients


class RecipeCreate(RecipeBase):
    pass


class RecipeResponse(RecipeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    rating_avg: float
    created_at: datetime


class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    recipe_id: int
    created_at: datetime


class CollectionBase(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: Optional[str] = None
    is_public: bool = True


class CollectionCreate(CollectionBase):
    pass


class CollectionResponse(CollectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    recipes: Optional[List[RecipeResponse]] = None


class ShoppingListItem(BaseModel):
    ingredient: str = Field(min_length=1, max_length=100)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)


class ShoppingListBase(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    recipes: List[int]
    items: List[ShoppingListItem]


class ShoppingListCreate(ShoppingListBase):
    pass


class ShoppingListResponse(ShoppingListBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str
