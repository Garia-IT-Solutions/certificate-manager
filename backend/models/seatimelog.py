from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SeaTimeLogCreate(BaseModel):
    imo: int
    offNo: int
    flag: str # litewawy countries
    vesselName: str
    type: str # enum
    company: str
    mainEngine: str
    bhp: float
    torque: float
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