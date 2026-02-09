from fastapi import APIRouter, Depends
from backend.controllers.dashboard_controller import get_dashboard_summary
from backend.dependencies import get_current_user
from backend.models.profile import Profile

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def dashboard_summary(current_user: Profile = Depends(get_current_user)):
    """Get aggregated dashboard summary data."""
    return get_dashboard_summary(current_user.id)
