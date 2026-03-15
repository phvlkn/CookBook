from database import SessionLocal, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def create_test_users():
    db = SessionLocal()
    
    test_users = [
        {
            "email": "admin@cookbook.ru",
            "password": "admin123", 
            "username": "admin",
            "is_staff": True
        },
        {
            "email": "user@cookbook.ru",
            "password": "user123",
            "username": "test_user"
        }
    ]
    
    for user_data in test_users:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            hashed_password = pwd_context.hash(user_data["password"])
            user = User(
                email=user_data["email"],
                password_hash=hashed_password,
                username=user_data["username"], 
                is_staff=user_data.get("is_staff", False)
            )
            db.add(user)
            print(f"Создан пользователь: {user_data['email']}")
    
    db.commit()
    db.close()
    print("Тестовые пользователи добавлены!")

if __name__ == "__main__":
    create_test_users()