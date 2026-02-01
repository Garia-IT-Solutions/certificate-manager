from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.models.seatimelog import SeaTimeLog, SeaTimeLogCreate
from backend.controllers import seatimelog_controller

router = APIRouter()

@router.post("/seatimelogs", response_model=SeaTimeLog, status_code=status.HTTP_201_CREATED)
def create_seatimelog(log: SeaTimeLogCreate):
    return seatimelog_controller.create_seatimelog(log)

@router.get("/seatimelogs", response_model=List[SeaTimeLog])
def read_seatimelogs():
    return seatimelog_controller.get_seatimelogs()

@router.get("/seatimelogs/{log_id}", response_model=SeaTimeLog)
def read_seatimelog(log_id: int):
    log = seatimelog_controller.get_seatimelog_by_id(log_id)
    if log is None:
        raise HTTPException(status_code=404, detail="Sea Time Log not found")
    return log

@router.delete("/seatimelogs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seatimelog(log_id: int):
    success = seatimelog_controller.delete_seatimelog(log_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sea Time Log not found")
