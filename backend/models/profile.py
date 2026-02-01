from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProfileBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    dob: Optional[datetime] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: List[str] = []
    certificates: List[int] = []

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    dob: Optional[datetime] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None
    certificates: Optional[List[int]] = None # allow to add only if valid cert

class Profile(ProfileBase):
    id: int

    class Config:
        from_attributes = True
