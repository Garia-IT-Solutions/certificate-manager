from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.auth import Token, LoginRequest
from backend.models.profile import ProfileCreate, Profile
from backend.controllers import profile_controller
from backend.utils.security import verify_password, create_access_token
from datetime import timedelta

router = APIRouter()

@router.post("/auth/login", response_model=Token)
def login(login_request: LoginRequest):
    user = profile_controller.get_profile_by_email(login_request.email)
    if not user or not verify_password(login_request.password, user.get('password_hash', '')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=7)
    access_token = create_access_token(
        data={"sub": user['email'], "id": user['id']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/register", response_model=Profile)
def register(profile: ProfileCreate):
    user = profile_controller.get_profile_by_email(profile.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return profile_controller.create_profile(profile)
