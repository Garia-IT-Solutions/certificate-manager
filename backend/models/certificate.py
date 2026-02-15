from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional

class CertificateCreate(BaseModel):
    cert: bytes
    certType: str 
    issuedBy: str
    status: str # enum["EXPIRING", "VALID", "INVALID"]
    expiry_date: Optional[date] = None
    certName: str
    issueDate: datetime
    uploadDate: datetime
    hidden: bool

class CertificateUpdate(BaseModel):
    cert: Optional[bytes] = None
    certType: Optional[str] = None
    issuedBy: Optional[str] = None
    status: Optional[str] = None
    expiry_date: Optional[date] = None
    certName: Optional[str] = None
    issueDate: Optional[datetime] = None
    hidden: Optional[bool] = None

class Certificate(CertificateCreate):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

class CertificateSummary(BaseModel):
    id: int
    certType: str
    issuedBy: str
    status: str
    expiry_date: Optional[date] = None
    certName: str
    issueDate: datetime
    uploadDate: datetime
    hidden: bool
    user_id: Optional[int] = None

    class Config:
        from_attributes = True
