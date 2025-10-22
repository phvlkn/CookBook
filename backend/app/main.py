from fastapi import FastAPI
from app.database import init_db

app = FastAPI(title="CookBook API")

@app.get("/api/recipes")
async def read_recipes():
    return {"message": "CookBook API is running"}

if __name__ == "__main__":
    init_db()
