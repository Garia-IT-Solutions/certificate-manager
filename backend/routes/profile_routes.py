from fastapi import APIRouter, HTTPException, status
from backend.models.profile import Profile, ProfileUpdate
from backend.controllers import profile_controller

router = APIRouter()

@router.get("/profile", response_model=Profile)
def read_profile():
    # Assuming single user for now (ID=1)
    profile = profile_controller.get_profile(1)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profile", response_model=Profile)
def update_profile(profile_data: ProfileUpdate):
    # Assuming single user for now (ID=1)
    updated_profile = profile_controller.update_profile(profile_data, 1)
    if updated_profile is None:
         raise HTTPException(status_code=404, detail="Profile not found")
    return updated_profile
