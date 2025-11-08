from fastapi import FastAPI, HTTPException, status
from database import init_db
from auth import authenticate_user, create_access_token
from schemas import UserLogin, Token
from datetime import timedelta

app = FastAPI(title="CookBook API")

@app.get("/api/recipes")
async def read_recipes():
    return {"message": "CookBook API is running"}

@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}