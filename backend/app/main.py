import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.api.routes import auth, collections, recipes, users
from backend.app.database import init_db


logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s")


def create_app() -> FastAPI:
    app = FastAPI(title="CookBook API")

    static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
    os.makedirs(os.path.join(static_dir, "images"), exist_ok=True)
    os.makedirs(os.path.join(static_dir, "avatars"), exist_ok=True)
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logging.info("Received %s %s", request.method, request.url)
        response = await call_next(request)
        logging.info("Responded %s to %s %s", response.status_code, request.method, request.url)
        return response

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(recipes.router)
    app.include_router(collections.router)
    app.include_router(collections.shopping_router)
    app.include_router(users.router)

    @app.get("/api/health", tags=["System"], summary="Health check")
    def healthcheck():
        return {"status": "ok", "service": "CookBook API"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    init_db()
    try:
        from backend.app.seed_data import create_seed_data

        create_seed_data()
    except Exception as error:
        print(f"Seeding failed: {error}")

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=False)
