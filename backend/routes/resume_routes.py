from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
import json

from backend.database import get_db_connection
from backend.models.resume import ResumeDraft, ResumeDraftCreate, ResumeDraftUpdate
from backend.dependencies import get_current_user
from backend.models.profile import Profile

router = APIRouter(prefix="/resumes", tags=["Resume Drafts"])

@router.post("/", response_model=ResumeDraft)
async def create_resume_draft(draft: ResumeDraftCreate, current_user: Profile = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO resume_drafts (user_id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (current_user.id, draft.name, json.dumps(draft.data), datetime.now(), datetime.now())
        )
        conn.commit()
        draft_id = cursor.lastrowid
        
        cursor.execute("SELECT * FROM resume_drafts WHERE id = ?", (draft_id,))
        new_draft = cursor.fetchone()
        
        return ResumeDraft(
            id=new_draft["id"],
            user_id=new_draft["user_id"],
            name=new_draft["name"],
            data=json.loads(new_draft["data"]),
            created_at=new_draft["created_at"],
            updated_at=new_draft["updated_at"]
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/", response_model=List[ResumeDraft])
async def get_resume_drafts(current_user: Profile = Depends(get_current_user)):
    conn = get_db_connection()
    conn.row_factory = lambda cursor, row: {
        "id": row[0],
        "user_id": row[1],
        "name": row[2],
        "data": json.loads(row[3]),
        "created_at": row[4],
        "updated_at": row[5]
    }
    cursor = conn.cursor()
    
    try:
        # Explicitly fetching columns to match row_factory indices
        cursor.execute("SELECT id, user_id, name, data, created_at, updated_at FROM resume_drafts WHERE user_id = ? ORDER BY updated_at DESC", (current_user.id,))
        drafts = cursor.fetchall()
        return drafts
    finally:
        conn.close()

@router.get("/{draft_id}", response_model=ResumeDraft)
async def get_resume_draft(draft_id: int, current_user: Profile = Depends(get_current_user)):
    conn = get_db_connection()
    conn.row_factory = lambda cursor, row: {
        "id": row[0],
        "user_id": row[1],
        "name": row[2],
        "data": json.loads(row[3]),
        "created_at": row[4],
        "updated_at": row[5]
    }
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, user_id, name, data, created_at, updated_at FROM resume_drafts WHERE id = ? AND user_id = ?", (draft_id, current_user.id))
        draft = cursor.fetchone()
        
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
            
        return draft
    finally:
        conn.close()

@router.put("/{draft_id}", response_model=ResumeDraft)
async def update_resume_draft(draft_id: int, draft_update: ResumeDraftUpdate, current_user: Profile = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if draft exists and belongs to user
        cursor.execute("SELECT * FROM resume_drafts WHERE id = ? AND user_id = ?", (draft_id, current_user.id))
        existing_draft = cursor.fetchone()
        
        if not existing_draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        
        updates = []
        values = []
        
        if draft_update.name is not None:
            updates.append("name = ?")
            values.append(draft_update.name)
            
        if draft_update.data is not None:
            updates.append("data = ?")
            values.append(json.dumps(draft_update.data))
            
        updates.append("updated_at = ?")
        values.append(datetime.now())
        
        values.append(draft_id)
        
        query = f"UPDATE resume_drafts SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, tuple(values))
        conn.commit()
        
        # Return updated draft
        # Use simple row factory/manual fetch for updated draft to handle JSON parsing
        cursor.execute("SELECT id, user_id, name, data, created_at, updated_at FROM resume_drafts WHERE id = ?", (draft_id,))
        row = cursor.fetchone()
        
        return ResumeDraft(
            id=row[0],
            user_id=row[1],
            name=row[2],
            data=json.loads(row[3]),
            created_at=row[4],
            updated_at=row[5]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.delete("/{draft_id}")
async def delete_resume_draft(draft_id: int, current_user: Profile = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM resume_drafts WHERE id = ? AND user_id = ?", (draft_id, current_user.id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Draft not found")
        conn.commit()
        return {"message": "Draft deleted successfully"}
    finally:
        conn.close()
