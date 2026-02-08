from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from backend.models.document import Document, DocumentCreate
from backend.controllers import document_controller
from backend.dependencies import get_current_user
from backend.models.profile import Profile

router = APIRouter()

@router.post("/documents", response_model=Document, status_code=status.HTTP_201_CREATED)
def create_document(doc: DocumentCreate, current_user: Profile = Depends(get_current_user)):
    return document_controller.create_document(doc, current_user.id)

@router.get("/documents", response_model=List[Document])
def read_documents(current_user: Profile = Depends(get_current_user)):
    return document_controller.get_documents(current_user.id)

@router.get("/documents/{doc_id}", response_model=Document)
def read_document(doc_id: int, current_user: Profile = Depends(get_current_user)):
    doc = document_controller.get_document_by_id(doc_id, current_user.id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, current_user: Profile = Depends(get_current_user)):
    success = document_controller.delete_document(doc_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
