-- Seed data for CookBook
-- Run with: psql postgresql://postgres:postgres@localhost:5432/cookbook -f backend/app/seed_data.sql

BEGIN;

-- USERS
INSERT INTO users (id, email, password_hash, username, avatar, bio, is_active, is_staff)
VALUES
  (1, 'alice@example.com', 'pbkdf2_sha256$dummy$hash1', 'alice', NULL, 'Home cook and baker', TRUE, FALSE),
  (2, 'bob@example.com',   'pbkdf2_sha256$dummy$hash2', 'bob',   NULL, 'Quick meals specialist', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- INGREDIENTS
INSERT INTO ingredients (id, name, default_unit)
VALUES
  (1, 'Flour', 'г'),
  (2, 'Sugar', 'г'),
  (3, 'Eggs', 'шт'),
  (4, 'Butter', 'г'),
  (5, 'Milk', 'мл'),
  (6, 'Salt', 'г')
ON CONFLICT (id) DO NOTHING;

-- RECIPES
INSERT INTO recipes (id, author_id, title, description, cook_time, category, diet, cuisine, steps, image, rating_avg)
VALUES
  (1, 1, 'Classic Pancakes', 'Fluffy classic pancakes perfect for breakfast.', 20, 'Breakfast', NULL, 'American',
    '[{"order": 1, "text": "Mix dry ingredients."}, {"order": 2, "text": "Add wet ingredients and whisk until smooth."}, {"order": 3, "text": "Pour batter on hot skillet and cook until golden."}]'::jsonb,
    NULL, 4.5),
  (2, 2, 'Cheese Omelette', 'Simple and quick cheese omelette.', 10, 'Breakfast', NULL, 'French',
    '[{"order": 1, "text": "Beat eggs with a pinch of salt."}, {"order": 2, "text": "Melt butter in a pan and pour eggs."}, {"order": 3, "text": "Add cheese and fold when set."}]'::jsonb,
    NULL, 4.0)
ON CONFLICT (id) DO NOTHING;

-- RECIPE INGREDIENTS (many-to-many)
INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit)
VALUES
  (1, 1, 1, 200, 'г'),  -- Flour for pancakes
  (2, 1, 2, 30,  'г'),  -- Sugar
  (3, 1, 3, 2,   'шт'), -- Eggs
  (4, 1, 5, 250, 'мл'), -- Milk
  (5, 1, 6, 1,   'щепотка'), -- Salt (demonstration of a textual unit)
  (6, 2, 3, 3,   'шт'), -- Eggs for omelette
  (7, 2, 4, 20,  'г') -- Butter
ON CONFLICT (id) DO NOTHING;

-- REVIEWS
INSERT INTO reviews (id, recipe_id, user_id, rating, comment)
VALUES
  (1, 1, 2, 5, 'Really fluffy and tasty!'),
  (2, 2, 1, 4, 'Quick breakfast, added herbs and it worked great.')
ON CONFLICT (id) DO NOTHING;

-- COLLECTIONS
INSERT INTO collections (id, user_id, title, description, is_public)
VALUES
  (1, 1, 'Weekend Brunch', 'Favorites for the weekend brunch table', TRUE),
  (2, 2, 'Quick Meals', 'Tasty meals under 15 minutes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- COLLECTION_RECIPES (many-to-many link)
INSERT INTO collection_recipes (id, collection_id, recipe_id)
VALUES
  (1, 1, 1),
  (2, 2, 2)
ON CONFLICT (id) DO NOTHING;

-- SHOPPING LISTS
INSERT INTO shopping_lists (id, user_id, title, recipes, items)
VALUES
  (1, 1, 'Pancake Ingredients', '[1]'::jsonb,
    '[{"ingredient": "Flour", "quantity": 200, "unit": "г"}, {"ingredient": "Sugar", "quantity": 30, "unit": "г"}, {"ingredient": "Eggs", "quantity": 2, "unit": "шт"}, {"ingredient": "Milk", "quantity": 250, "unit": "мл"}]'::jsonb),
  (2, 2, 'Omelette Quick',    '[2]'::jsonb,
    '[{"ingredient": "Eggs", "quantity": 3, "unit": "шт"}, {"ingredient": "Butter", "quantity": 20, "unit": "г"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Reset sequences to max(id) to avoid conflicts when inserting without ids later
SELECT pg_catalog.setval(pg_get_serial_sequence('users','id'),       (SELECT COALESCE(MAX(id),1) FROM users), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('ingredients','id'), (SELECT COALESCE(MAX(id),1) FROM ingredients), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('recipes','id'),     (SELECT COALESCE(MAX(id),1) FROM recipes), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('recipe_ingredients','id'), (SELECT COALESCE(MAX(id),1) FROM recipe_ingredients), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('reviews','id'),     (SELECT COALESCE(MAX(id),1) FROM reviews), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('collections','id'), (SELECT COALESCE(MAX(id),1) FROM collections), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('collection_recipes','id'), (SELECT COALESCE(MAX(id),1) FROM collection_recipes), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('shopping_lists','id'), (SELECT COALESCE(MAX(id),1) FROM shopping_lists), true);
