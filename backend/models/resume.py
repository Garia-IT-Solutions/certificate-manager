from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ResumeDraftCreate(BaseModel):
    name: str
    data: Dict[str, Any]

class ResumeDraftUpdate(BaseModel):
    name: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class ResumeDraft(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
