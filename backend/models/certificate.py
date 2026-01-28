from pydantic import BaseModel
from typing import Optional

class CertificateCreate(BaseModel):
    name: str
    domain: str
    issue_date: str
    expiry_date: str
    status: str

class Certificate(CertificateCreate):
    id: int

    class Config:
        from_attributes = True
