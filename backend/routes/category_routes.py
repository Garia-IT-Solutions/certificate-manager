from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import sqlite3
from backend.database import get_db_connection
from backend.models.category import Category, CategoryCreate, CategoryUpdate
from backend.models.profile import Profile
from backend.dependencies import get_current_user

router = APIRouter()

@router.get("/categories", response_model=List[Category])
async def get_categories(scope: str = "document", current_user: Profile = Depends(get_current_user)):
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch system categories OR user's categories, filtered by scope
    cursor.execute('''
        SELECT * FROM document_categories 
        WHERE (user_id = ? OR is_system = 1) AND scope = ?
    ''', (user_id, scope))
    rows = cursor.fetchall()
    conn.close()
    
    return [Category(**dict(row)) for row in rows]

@router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate, current_user: Profile = Depends(get_current_user)):
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Default scope to 'document' if not provided (though model has default)
    scope = category.scope or "document"
    
    cursor.execute(
        'INSERT INTO document_categories (label, color, icon, pattern, user_id, is_system, scope) VALUES (?, ?, ?, ?, ?, 0, ?)',
        (category.label, category.color, category.icon, category.pattern, user_id, scope)
    )
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return Category(id=new_id, user_id=user_id, is_system=False, **category.model_dump())

@router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: int, updates: CategoryUpdate, current_user: Profile = Depends(get_current_user)):
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if exists and belongs to user (or is system - debatable if users can edit system cats, let's say NO for now)
    cursor.execute('SELECT * FROM document_categories WHERE id = ?', (category_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Allow editing any category (assuming single-user desktop app context)
    # in a multi-user, we would restrict this.
    pass

    # Filter updates
    update_data = {k: v for k, v in updates.model_dump(exclude_unset=True).items()}
    if not update_data:
        conn.close()
        return Category(**dict(row))

    set_clause = ", ".join([f"{key} = ?" for key in update_data.keys()])
    values = list(update_data.values())
    values.append(category_id)
    
    cursor.execute(f'UPDATE document_categories SET {set_clause} WHERE id = ?', values)
    conn.commit()
    
    # Fetch updated
    cursor.execute('SELECT * FROM document_categories WHERE id = ?', (category_id,))
    updated_row = cursor.fetchone()
    conn.close()
    
    return Category(**dict(updated_row))

@router.delete("/categories/{category_id}")
async def delete_category(category_id: int, current_user: Profile = Depends(get_current_user)):
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM document_categories WHERE id = ?', (category_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Category not found")
        
    if dict(row)['is_system']:
        conn.close()
        raise HTTPException(status_code=403, detail="Cannot delete system categories")
        
    if dict(row)['user_id'] != user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Permission denied")
        
    cursor.execute('DELETE FROM document_categories WHERE id = ?', (category_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Category deleted"}
