"""Create demo login for judges. Idempotent."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from passlib.context import CryptContext
from database.database import SessionLocal
from app.models.user import User, UserRole, UserStatus

EMAIL = "test@example.com"
PASSWORD = "Test12345!"

def main():
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == EMAIL).first()
        if u:
            print(f"demo user exists: {EMAIL}")
            return
        u = User(
            email=EMAIL,
            password=CryptContext(["bcrypt"], deprecated="auto").hash(PASSWORD),
            username="testuser",
            name="Test",
            surname="Conductor",
            user_role=UserRole.user,
            user_status=UserStatus.verificated,
            verified=True,
            blocked=False,
        )
        db.add(u)
        db.commit()
        print(f"demo user created: {EMAIL} / {PASSWORD}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
