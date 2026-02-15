from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SeaTimeLogCreate(BaseModel):
    imo: str | int
    offNo: str | int
    flag: str # litewawy countries
    vesselName: str
    type: str # enum
    company: str
    dept: Optional[str] = "ENGINE" # Default to ENGINE if missing
    mainEngine: Optional[str] = "" # Optional for DECK department
    bhp: Optional[float] = 0 # Optional for DECK department
    torque: Optional[float] = 0 # Optional for DECK department
    dwt: float
    rank: str
    signOn: datetime
    signOff: datetime
    uploadDate: datetime #TIMESTAMP

class SeaTimeLog(SeaTimeLogCreate):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True
