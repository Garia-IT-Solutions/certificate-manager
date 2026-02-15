from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from backend.models.certificate import Certificate, CertificateCreate, CertificateUpdate, CertificateSummary
from backend.controllers import certificate_controller
from backend.dependencies import get_current_user
from backend.models.profile import Profile

router = APIRouter()

@router.post("/certificates", response_model=Certificate, status_code=status.HTTP_201_CREATED)
def create_certificate(cert: CertificateCreate, current_user: Profile = Depends(get_current_user)):
    try:
        return certificate_controller.create_certificate(cert, current_user.id)
    except Exception as e:
        print(f"Error creating certificate: {e}")
        raise e

@router.get("/certificates", response_model=List[CertificateSummary])
def read_certificates(current_user: Profile = Depends(get_current_user)):
    return certificate_controller.get_certificates(current_user.id)

@router.get("/certificates/{cert_id}", response_model=Certificate)
def read_certificate(cert_id: int, current_user: Profile = Depends(get_current_user)):
    cert = certificate_controller.get_certificate_by_id(cert_id, current_user.id)
    if cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@router.put("/certificates/{cert_id}", response_model=Certificate)
def update_certificate(cert_id: int, cert_update: CertificateUpdate, current_user: Profile = Depends(get_current_user)):
    updated_cert = certificate_controller.update_certificate(cert_id, cert_update, current_user.id)
    if updated_cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return updated_cert

@router.delete("/certificates/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certificate(cert_id: int, current_user: Profile = Depends(get_current_user)):
    success = certificate_controller.delete_certificate(cert_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Certificate not found")
