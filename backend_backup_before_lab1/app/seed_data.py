from passlib.hash import pbkdf2_sha256
from database import (
    SessionLocal,
    User,
    Ingredient,
    Recipe,
    Review,
    Collection,
    ShoppingList,
    RecipeIngredients,
    CollectionRecipes,
)


def create_seed_data():
    db = SessionLocal()
    try:
        # --- Users ---
        users = [
            {"email": "alice@example.com", "password": "alicepass", "username": "alice", "bio": "Home cook and baker"},
            {"email": "bob@example.com",   "password": "bobpass",   "username": "bob",   "bio": "Quick meals specialist"},
        ]

        for u in users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                hashed = pbkdf2_sha256.hash(u["password"])
                user = User(email=u["email"], password_hash=hashed, username=u["username"], bio=u.get("bio"))
                db.add(user)
        db.commit()

        # fetch created users
        alice = db.query(User).filter(User.email == "alice@example.com").first()
        bob = db.query(User).filter(User.email == "bob@example.com").first()

        # --- Ingredients ---
        ing_names = [
            ("Flour", "г"), ("Sugar", "г"), ("Eggs", "шт"), ("Butter", "г"), ("Milk", "мл"), ("Salt", "г")
        ]
        for name, unit in ing_names:
            if not db.query(Ingredient).filter(Ingredient.name == name).first():
                db.add(Ingredient(name=name, default_unit=unit))
        db.commit()

        # fetch ingredients
        flour = db.query(Ingredient).filter(Ingredient.name == "Flour").first()
        sugar = db.query(Ingredient).filter(Ingredient.name == "Sugar").first()
        eggs = db.query(Ingredient).filter(Ingredient.name == "Eggs").first()
        butter = db.query(Ingredient).filter(Ingredient.name == "Butter").first()
        milk = db.query(Ingredient).filter(Ingredient.name == "Milk").first()
        salt = db.query(Ingredient).filter(Ingredient.name == "Salt").first()

        # --- Recipes ---
        pancakes = db.query(Recipe).filter(Recipe.title == "Classic Pancakes").first()
        if not pancakes:
            pancakes = Recipe(
                author_id=alice.id,
                title="Classic Pancakes",
                description="Fluffy classic pancakes perfect for breakfast.",
                cook_time=20,
                category="Breakfast",
                cuisine="American",
                steps=[
                    {"order": 1, "text": "Mix dry ingredients."},
                    {"order": 2, "text": "Add wet ingredients and whisk until smooth."},
                    {"order": 3, "text": "Pour batter on hot skillet and cook until golden."},
                ],
                rating_avg=4.5,
            )
            db.add(pancakes)
            db.commit()
            db.refresh(pancakes)

            # recipe ingredients
            db.execute(RecipeIngredients.insert().values(recipe_id=pancakes.id, ingredient_id=flour.id, quantity=200, unit='г'))
            db.execute(RecipeIngredients.insert().values(recipe_id=pancakes.id, ingredient_id=sugar.id, quantity=30, unit='г'))
            db.execute(RecipeIngredients.insert().values(recipe_id=pancakes.id, ingredient_id=eggs.id, quantity=2, unit='шт'))
            db.execute(RecipeIngredients.insert().values(recipe_id=pancakes.id, ingredient_id=milk.id, quantity=250, unit='мл'))
            db.execute(RecipeIngredients.insert().values(recipe_id=pancakes.id, ingredient_id=salt.id, quantity=1, unit='щепотка'))
            db.commit()

        omelette = db.query(Recipe).filter(Recipe.title == "Cheese Omelette").first()
        if not omelette:
            omelette = Recipe(
                author_id=bob.id,
                title="Cheese Omelette",
                description="Simple and quick cheese omelette.",
                cook_time=10,
                category="Breakfast",
                cuisine="French",
                steps=[
                    {"order": 1, "text": "Beat eggs with a pinch of salt."},
                    {"order": 2, "text": "Melt butter in a pan and pour eggs."},
                    {"order": 3, "text": "Add cheese and fold when set."},
                ],
                rating_avg=4.0,
            )
            db.add(omelette)
            db.commit()
            db.refresh(omelette)
            db.execute(RecipeIngredients.insert().values(recipe_id=omelette.id, ingredient_id=eggs.id, quantity=3, unit='шт'))
            db.execute(RecipeIngredients.insert().values(recipe_id=omelette.id, ingredient_id=butter.id, quantity=20, unit='г'))
            db.commit()

        # --- Reviews ---
        if not db.query(Review).filter(Review.recipe_id == pancakes.id, Review.user_id == bob.id).first():
            db.add(Review(recipe_id=pancakes.id, user_id=bob.id, rating=5, comment='Really fluffy and tasty!'))
        if not db.query(Review).filter(Review.recipe_id == omelette.id, Review.user_id == alice.id).first():
            db.add(Review(recipe_id=omelette.id, user_id=alice.id, rating=4, comment='Quick breakfast, added herbs and it worked great.'))
        db.commit()

        # --- Collections ---
        coll1 = db.query(Collection).filter(Collection.title == 'Weekend Brunch', Collection.user_id == alice.id).first()
        if not coll1:
            coll1 = Collection(user_id=alice.id, title='Weekend Brunch', description='Favorites for the weekend brunch table', is_public=True)
            db.add(coll1)
            db.commit()
            db.refresh(coll1)
        coll2 = db.query(Collection).filter(Collection.title == 'Quick Meals', Collection.user_id == bob.id).first()
        if not coll2:
            coll2 = Collection(user_id=bob.id, title='Quick Meals', description='Tasty meals under 15 minutes', is_public=True)
            db.add(coll2)
            db.commit()
            db.refresh(coll2)

        # collection recipes links
        exists = db.execute("SELECT 1 FROM collection_recipes WHERE collection_id = :c AND recipe_id = :r", {"c": coll1.id, "r": pancakes.id}).fetchone()
        if not exists:
            db.execute(CollectionRecipes.insert().values(collection_id=coll1.id, recipe_id=pancakes.id))
        exists = db.execute("SELECT 1 FROM collection_recipes WHERE collection_id = :c AND recipe_id = :r", {"c": coll2.id, "r": omelette.id}).fetchone()
        if not exists:
            db.execute(CollectionRecipes.insert().values(collection_id=coll2.id, recipe_id=omelette.id))
        db.commit()

        # --- Shopping lists ---
        sl1 = db.query(ShoppingList).filter(ShoppingList.title == 'Pancake Ingredients', ShoppingList.user_id == alice.id).first()
        if not sl1:
            db.add(ShoppingList(
                user_id=alice.id,
                title='Pancake Ingredients',
                recipes=[pancakes.id],
                items=[
                    {"ingredient": "Flour", "quantity": 200, "unit": "г"},
                    {"ingredient": "Sugar", "quantity": 30, "unit": "г"},
                    {"ingredient": "Eggs", "quantity": 2, "unit": "шт"},
                    {"ingredient": "Milk", "quantity": 250, "unit": "мл"},
                ]
            ))
        sl2 = db.query(ShoppingList).filter(ShoppingList.title == 'Omelette Quick', ShoppingList.user_id == bob.id).first()
        if not sl2:
            db.add(ShoppingList(
                user_id=bob.id,
                title='Omelette Quick',
                recipes=[omelette.id],
                items=[
                    {"ingredient": "Eggs", "quantity": 3, "unit": "шт"},
                    {"ingredient": "Butter", "quantity": 20, "unit": "г"},
                ]
            ))
        db.commit()

        print("Seed data created/ensured")

    finally:
        db.close()


if __name__ == '__main__':
    create_seed_data()
