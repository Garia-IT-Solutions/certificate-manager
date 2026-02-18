from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from backend.models.seatimelog import SeaTimeLog, SeaTimeLogCreate
from backend.controllers import seatimelog_controller
from backend.dependencies import get_current_user
from backend.models.profile import Profile

router = APIRouter()

@router.post("/seatimelogs", response_model=SeaTimeLog, status_code=status.HTTP_201_CREATED)
def create_seatimelog(log: SeaTimeLogCreate, current_user: Profile = Depends(get_current_user)):
    return seatimelog_controller.create_seatimelog(log, current_user.id)

@router.get("/seatimelogs", response_model=List[SeaTimeLog])
def read_seatimelogs(current_user: Profile = Depends(get_current_user)):
    return seatimelog_controller.get_seatimelogs(current_user.id)

@router.get("/seatimelogs/{log_id}", response_model=SeaTimeLog)
def read_seatimelog(log_id: int, current_user: Profile = Depends(get_current_user)):
    log = seatimelog_controller.get_seatimelog_by_id(log_id, current_user.id)
    if log is None:
        raise HTTPException(status_code=404, detail="Sea Time Log not found")
    return log


@router.put("/seatimelogs/{log_id}", response_model=SeaTimeLog)
def update_seatimelog(log_id: int, log: SeaTimeLogCreate, current_user: Profile = Depends(get_current_user)):
    updated_log = seatimelog_controller.update_seatimelog(log_id, log, current_user.id)
    if updated_log is None:
        raise HTTPException(status_code=404, detail="Sea Time Log not found")
    return updated_log

@router.delete("/seatimelogs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seatimelog(log_id: int, current_user: Profile = Depends(get_current_user)):
    success = seatimelog_controller.delete_seatimelog(log_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Sea Time Log not found")
