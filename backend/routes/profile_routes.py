from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.profile import Profile, ProfileUpdate
from backend.controllers import profile_controller
from backend.dependencies import get_current_user

router = APIRouter()

@router.get("/profile", response_model=Profile)
def read_profile(current_user: Profile = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=Profile)
def update_profile(profile_data: ProfileUpdate, current_user: Profile = Depends(get_current_user)):
    updated_profile = profile_controller.update_profile(profile_data, current_user.id)
    if updated_profile is None:
         raise HTTPException(status_code=404, detail="Profile not found")
    return updated_profile
