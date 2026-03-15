import os
import uuid

from fastapi import HTTPException, UploadFile


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def save_uploaded_file(
    image: UploadFile | None,
    static_root: str,
    subfolder: str = "images",
) -> str | None:
    if image is None or not image.filename:
        return None

    extension = os.path.splitext(image.filename)[1].lower() or ".jpg"
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат изображения")

    images_dir = os.path.join(static_root, subfolder)
    os.makedirs(images_dir, exist_ok=True)

    # Use a generated filename so uploads do not overwrite each other.
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = os.path.join(images_dir, filename)
    with open(destination, "wb") as file_obj:
        file_obj.write(image.file.read())

    return f"/static/{subfolder}/{filename}"


def save_recipe_image(image: UploadFile | None, static_root: str) -> str | None:
    return save_uploaded_file(image, static_root, subfolder="images")
