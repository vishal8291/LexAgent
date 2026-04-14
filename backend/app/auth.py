from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "lexagent-secret-key")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    password_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain[:72].encode('utf-8'),
            hashed.encode('utf-8')
        )
    except Exception:
        return False

def create_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[dict]:
    if not credentials:
        return None
    return decode_token(credentials.credentials)

async def require_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please login to continue"
        )
    return user