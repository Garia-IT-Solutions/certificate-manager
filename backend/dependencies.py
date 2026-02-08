from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from backend.utils.security import SECRET_KEY, ALGORITHM
from backend.controllers.profile_controller import get_profile_by_email
from backend.models.profile import Profile
import json

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_dict = get_profile_by_email(email)
    if user_dict is None:
        raise credentials_exception
        
    # Convert dict to Profile object if necessary, ensuring skills are handled
    # The controller returns a dict with skills as list (already parsed if using get_profile_by_email)
    # But Profile model expects specific fields. 
    # Let's ensure we return what the route expects. 
    # Actually, the route expects a Profile object usually, or Pydantic model.
    # get_profile_by_email returns a dict. 
    
    return Profile(**user_dict)
