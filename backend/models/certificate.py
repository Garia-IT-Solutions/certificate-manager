from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CertificateCreate(BaseModel):
    cert: bytes
    certType: str 
    issuedBy: str
    status: str # enum["EXPIRING", "VALID", "INVALID"]
    expiry: datetime
    certName: str
    issueDate: datetime
    uploadDate: datetime
    hidden: bool

class CertificateUpdate(BaseModel):
    cert: Optional[bytes] = None
    certType: Optional[str] = None
    issuedBy: Optional[str] = None
    status: Optional[str] = None
    expiry: Optional[datetime] = None
    certName: Optional[str] = None
    issueDate: Optional[datetime] = None
    hidden: Optional[bool] = None

class Certificate(CertificateCreate):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True
