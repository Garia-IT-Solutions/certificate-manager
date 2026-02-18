from pydantic import BaseModel
from typing import Optional

class CategoryCreate(BaseModel):
    label: str
    color: str # 'emerald', 'orange', 'blue', 'purple', 'zinc', 'red', 'pink', 'indigo'
    icon: str # key for lucide-react icon
    pattern: Optional[str] = None
    scope: str = "document" # 'document' or 'certificate'

class CategoryUpdate(BaseModel):
    label: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    pattern: Optional[str] = None
    scope: Optional[str] = None

class Category(CategoryCreate):
    id: int
    user_id: int
    is_system: bool = False # System categories cannot be deleted, only edited (maybe?)

    class Config:
        from_attributes = True