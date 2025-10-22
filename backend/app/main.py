from fastapi import FastAPI

app = FastAPI(title="CookBook API")

@app.get("/api/recipes")
async def read_recipes():
    return {"message": "CookBook API is running"}
