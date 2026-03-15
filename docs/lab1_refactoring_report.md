# Отчет по лабораторной работе 1

## Тема работы
Рефакторинг backend-части проекта `CookBook`.

## Цель работы
Изучить и применить рефакторинг на примере реального backend-проекта, улучшить читаемость и сопровождаемость кода, уменьшить связность модулей, устранить найденные недостатки и зафиксировать результат в виде сравнения состояния проекта до и после изменений.

## Исходные данные
- Исходная версия backend сохранена в папке `/Users/emin/Documents/MTUCI/CookBook/backend_backup_before_lab1`.
- Отрефакторенная версия backend находится в папке `/Users/emin/Documents/MTUCI/CookBook/backend`.

## Ход работы
1. Выполнен анализ исходной структуры backend.
   Было установлено, что основная логика API сосредоточена в одном файле `main.py`, из-за чего маршруты, авторизация, загрузка файлов и работа с данными оказались тесно связаны между собой.

2. Выявлены основные проблемы исходной реализации.
   К ним относятся избыточный размер точки входа, слабая модульность, дублирование части логики, недостаточная валидация входных данных, а также скрытая ошибка в удалении рецептов.

3. Создана резервная копия исходного backend.
   Это позволило сохранить исходные файлы для примеров рефакторинга "до/после" и безопасно выполнять изменения в рабочей версии проекта.

4. Backend переведен на пакетную структуру Python.
   Добавлены служебные файлы `__init__.py`, а запуск проекта переведен на формат `python -m backend.app.main`.

5. Выполнено разделение кода по ответственности.
   Из `main.py` маршруты были вынесены в отдельные файлы:
   `auth.py`, `recipes.py`, `collections.py`, `users.py`.
   За счет этого точка входа стала отвечать только за сборку приложения и подключение роутеров.

6. Выполнен рефакторинг бизнес-логики.
   В файле `crud.py` добавлены вспомогательные функции для получения сущностей и сериализации рецептов, устранено дублирование, улучшены проверки существования записей, исправлена логика удаления рецепта, добавлена защита от повторного добавления рецепта в коллекцию.

7. Улучшена логика авторизации.
   В `auth.py` добавлена единая функция хеширования пароля, конфигурация JWT вынесена в переменные окружения, а создание токена переведено на более корректную работу со временем.

8. Усилена валидация входных данных.
   В `schemas.py` добавлены ограничения на поля моделей: длины строк, диапазоны числовых значений, обязательность хотя бы одного шага приготовления и хотя бы одного ингредиента.

9. Выделена работа с файлами в отдельный сервис.
   Логика сохранения изображения рецепта вынесена в `backend/app/services/file_service.py`, что уменьшило размер маршрута и повысило читаемость.

10. Обновлены файлы инициализации тестовых данных.
    Файлы `seed_data.py` и `seed_users.py` приведены к новой структуре импортов и используют единую функцию хеширования паролей.

11. Выполнена проверка результата.
    Проведена проверка синтаксиса модулей. Также дополнительно установлено, что для полного запуска приложения в текущем виртуальном окружении требуется установленный пакет `python-multipart`.

## Примеры рефакторинга "до / после"

### Пример 1. Точка входа приложения
До рефакторинга файл `main.py` содержал почти всю backend-логику проекта: подключение зависимостей, регистрацию маршрутов, обработку загрузки изображений, авторизацию, работу с коллекциями, отзывами и пользователями.

Фрагмент до рефакторинга:

```python
@app.post("/api/recipes/upload", response_model=RecipeResponse)
def upload_recipe(
    recipe_json: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        recipe_data = json.loads(recipe_json)
        recipe_obj = RecipeCreate(**recipe_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid recipe JSON: {e}")
```

После рефакторинга точка входа отвечает только за создание приложения и подключение роутеров:

```python
def create_app() -> FastAPI:
    app = FastAPI(title="CookBook API")
    app.include_router(auth.router)
    app.include_router(recipes.router)
    app.include_router(collections.router)
    app.include_router(collections.shopping_router)
    app.include_router(users.router)
    return app
```

Результат:
- код стал короче и проще;
- точка входа больше не перегружена бизнес-логикой;
- дальнейшее расширение API стало удобнее.

### Пример 2. Исправление удаления рецепта
До рефакторинга в `crud.py` использовалась функция `get_recipe_by_id`, которая возвращала уже сериализованный результат, после чего выполнялась попытка удалить его как ORM-объект:

```python
def delete_recipe(db: Session, recipe_id: int, user_id: int):
    recipe = get_recipe_by_id(db, recipe_id)
    if recipe.author_id != user_id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление рецепта")
    db.delete(recipe)
```

После рефакторинга удаление работает через получение ORM-сущности:

```python
def delete_recipe(db: Session, recipe_id: int, user_id: int):
    recipe = _get_recipe_entity_or_404(db, recipe_id)
    if recipe.author_id != user_id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление рецепта")
    db.delete(recipe)
```

Результат:
- устранена скрытая логическая ошибка;
- поведение удаления стало корректным;
- код стал более надежным.

### Пример 3. Улучшение сериализации рецептов
До рефакторинга для каждого ингредиента выполнялся отдельный запрос внутри цикла, что ухудшало производительность:

```python
for r in rows:
    ing = db.query(Ingredient).filter(Ingredient.id == r['ingredient_id']).first()
    if not ing:
        continue
```

После рефакторинга ингредиенты для набора рецептов загружаются одной общей выборкой:

```python
stmt = (
    select(
        RecipeIngredients.c.recipe_id,
        RecipeIngredients.c.quantity,
        RecipeIngredients.c.unit,
        Ingredient.name,
        Ingredient.default_unit,
    )
    .join(Ingredient, Ingredient.id == RecipeIngredients.c.ingredient_id)
)
```

Результат:
- уменьшено количество обращений к базе данных;
- улучшена производительность;
- сериализация стала централизованной и легче поддерживается.

## Комментарии к коду
В ходе рефакторинга были добавлены только точечные комментарии в местах, где логика неочевидна, например при устранении `N+1` запросов и при сохранении изображения с уникальным именем.

Использование комментариев в таком виде оправдано, потому что:
- они поясняют сложный участок, а не дублируют очевидный код;
- помогают быстро понять, зачем был изменен фрагмент;
- улучшают читаемость без перегрузки файла лишним текстом.

При этом избыточное комментирование каждой строки не требуется. Если код хорошо структурирован, имеет понятные имена функций и разделен по модулям, основная читаемость достигается именно рефакторингом, а не количеством комментариев.

## Результаты работы
В рамках лабораторной работы были изменены следующие основные файлы:
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/main.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/auth.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/crud.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/database.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/schemas.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/seed_data.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/seed_users.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/services/file_service.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/api/routes/auth.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/api/routes/recipes.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/api/routes/collections.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/app/api/routes/users.py`
- `/Users/emin/Documents/MTUCI/CookBook/backend/Dockerfile`
- `/Users/emin/Documents/MTUCI/CookBook/docker-compose.yml`

## Проверка результата
1. Выполнена проверка синтаксиса командой `python -m compileall backend/app`.
2. Проверка импорта приложения показала, что для полного старта в текущем виртуальном окружении дополнительно нужен пакет `python-multipart`, хотя в файле зависимостей он уже указан.

## Выводы
В ходе лабораторной работы был выполнен рефакторинг backend-части проекта `CookBook`. В результате код стал более модульным, читаемым и удобным для сопровождения. Были исправлены отдельные ошибки, улучшена структура приложения, усилена валидация входных данных и снижена связность между частями системы. Сравнение версий до и после рефакторинга показывает, что изменение структуры проекта и выделение ответственности по модулям положительно влияет на качество программного кода.
