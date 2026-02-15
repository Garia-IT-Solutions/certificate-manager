from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional, List
from typing import Optional

class DocumentBase(BaseModel):
    docID: str
    docType: str # (passport, drivers license (2020))
    category: str # (medical, safety, travel, tech, identity)
    status: str #enum["EXPIRING", "VALID", "INVALID"]
    expiry: Optional[date] = None
    issuedBy: Optional[str] = "Self"
    docName: str
    issueDate: datetime
    uploadDate: datetime
    hidden: bool
    archived: bool = False

class DocumentCreate(DocumentBase):
    doc: bytes

class Document(DocumentCreate):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

class DocumentSummary(DocumentBase):
    id: int
    user_id: Optional[int] = None
    docSize: Optional[int] = 0

    class Config:
        from_attributes = True