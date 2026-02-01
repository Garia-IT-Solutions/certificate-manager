from datetime import datetime
from pydantic import BaseModel

class DocumentCreate(BaseModel):
    docID: str
    doc: bytes
    docType: str # (passport, drivers license (2020))
    category: str # (medical, safety, travel, tech, identity)
    status: str #enum["EXPIRING", "VALID", "INVALID"]
    expiry: datetime
    docName: str
    issueDate: datetime
    uploadDate: datetime
    hidden: bool

class Document(DocumentCreate):
    id: int

    class Config:
        from_attributes = True