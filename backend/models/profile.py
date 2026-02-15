from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class ProfileBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    dob: Optional[datetime] = None
    gender: Optional[str] = None
    middle_name: Optional[str] = None
    nationality: Optional[str] = None
    place_of_birth: Optional[str] = None
    date_available: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None # Deprecated, use permanent_address/present_address
    permanent_address: Optional[str] = None # JSON string
    present_address: Optional[str] = None # JSON string
    next_of_kin: Optional[str] = None # JSON string
    physical_description: Optional[str] = None # JSON string
    avatar_url: Optional[str] = None
    skills: List[str] = []
    certificates: List[int] = []
    rank: Optional[str] = None
    department: Optional[str] = None

    @field_validator('dob', mode='before')
    @classmethod
    def parse_dob(cls, v):
        if not v:
            return None
        return v

class ProfileCreate(ProfileBase):
    password: str

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    nationality: Optional[str] = None
    date_available: Optional[str] = None
    place_of_birth: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    dob: Optional[datetime] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    permanent_address: Optional[str] = None
    present_address: Optional[str] = None
    next_of_kin: Optional[str] = None
    physical_description: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None
    certificates: Optional[List[int]] = None
    rank: Optional[str] = None
    department: Optional[str] = None

class Profile(ProfileBase):
    id: int

    class Config:
        from_attributes = True
