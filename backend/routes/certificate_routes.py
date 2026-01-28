from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.models.certificate import Certificate, CertificateCreate
from backend.controllers import certificate_controller

router = APIRouter()

@router.post("/certificates", response_model=Certificate, status_code=status.HTTP_201_CREATED)
def create_certificate(cert: CertificateCreate):
    return certificate_controller.create_certificate(cert)

@router.get("/certificates", response_model=List[Certificate])
def read_certificates():
    return certificate_controller.get_certificates()

@router.get("/certificates/{cert_id}", response_model=Certificate)
def read_certificate(cert_id: int):
    cert = certificate_controller.get_certificate_by_id(cert_id)
    if cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@router.delete("/certificates/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certificate(cert_id: int):
    success = certificate_controller.delete_certificate(cert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certificate not found")
