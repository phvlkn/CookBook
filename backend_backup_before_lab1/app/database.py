import os
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Text,
    Float,
    ForeignKey,
    DateTime,
    JSON,
    Table,
    DECIMAL,
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # Default to localhost for local dev (Postgres.app or local container bound to 5432).
    # When running inside docker-compose the env var should be set to use host `db`.
    "postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/cookbook",
)

Base = declarative_base()

# ---------- ВСПОМОГАТЕЛЬНЫЕ ТАБЛИЦЫ (Many-to-Many) ----------

RecipeIngredients = Table(
    "recipe_ingredients",
    Base.metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("recipe_id", Integer, ForeignKey("recipes.id", ondelete="CASCADE")),
    Column("ingredient_id", Integer, ForeignKey("ingredients.id", ondelete="CASCADE")),
    Column("quantity", DECIMAL(6, 2), nullable=False),
    Column("unit", String(20), nullable=False, default="г"),
)

CollectionRecipes = Table(
    "collection_recipes",
    Base.metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("collection_id", Integer, ForeignKey("collections.id", ondelete="CASCADE")),
    Column("recipe_id", Integer, ForeignKey("recipes.id", ondelete="CASCADE")),
)

# ---------- ОСНОВНЫЕ ТАБЛИЦЫ ----------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    username = Column(String(100), nullable=False)
    avatar = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    date_joined = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)

    recipes = relationship("Recipe", back_populates="author", cascade="all, delete")
    reviews = relationship("Review", back_populates="user", cascade="all, delete")
    collections = relationship("Collection", back_populates="user", cascade="all, delete")
    shopping_lists = relationship("ShoppingList", back_populates="user", cascade="all, delete")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    cook_time = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    diet = Column(String(50), nullable=True)
    cuisine = Column(String(50), nullable=True)
    steps = Column(JSONB, nullable=False)
    image = Column(String(255), nullable=True)
    rating_avg = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    author = relationship("User", back_populates="recipes")
    ingredients = relationship("Ingredient", secondary=RecipeIngredients, back_populates="recipes")
    reviews = relationship("Review", back_populates="recipe", cascade="all, delete")
    collections = relationship("Collection", secondary=CollectionRecipes, back_populates="recipes")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    default_unit = Column(String(20), default="г")

    recipes = relationship("Recipe", secondary=RecipeIngredients, back_populates="ingredients")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipe = relationship("Recipe", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="collections")
    recipes = relationship("Recipe", secondary=CollectionRecipes, back_populates="collections")


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(150), nullable=False)
    recipes = Column(JSONB, nullable=False)
    items = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="shopping_lists")

# ---------- НАСТРОЙКА СЕССИИ ----------

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Создание всех таблиц в БД"""
    Base.metadata.create_all(bind=engine)

# ---------- ФУНКЦИЯ ДЛЯ ЗАВИСИМОСТЕЙ FASTAPI ----------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()