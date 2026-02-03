from datetime import datetime, timedelta
from typing import Optional, Union
from jose import jwt
import bcrypt  # We are replacing passlib with direct bcrypt usage

# Configuration
SECRET_KEY = "your-secret-key-keep-it-secret" # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a bcrypt hash.
    Handles the conversion of strings to bytes automatically.
    """
    # bcrypt requires bytes, so we encode strings if necessary
    if isinstance(hashed_password, str):
        hashed_bytes = hashed_password.encode('utf-8')
    else:
        hashed_bytes = hashed_password
        
    plain_bytes = plain_password.encode('utf-8')
    
    try:
        # Check the password
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except ValueError:
        # Handles invalid salts or malformed hashes gracefully
        return False

def get_password_hash(password: str) -> str:
    """
    Hashes a password using bcrypt. Returns a string.
    """
    pwd_bytes = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Return as string for database storage
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt