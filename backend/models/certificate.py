from datetime import datetime
from pydantic import BaseModel

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

class Certificate(CertificateCreate):
    id: int

    class Config:
        from_attributes = True
