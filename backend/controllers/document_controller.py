import sqlite3
from backend.database import get_db_connection
from backend.models.document import Document, DocumentCreate, DocumentSummary
from typing import List, Optional

def create_document(doc: DocumentCreate, user_id: int) -> Document:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO documents (docID, doc, docType, category, status, expiry, docName, issueDate, uploadDate, hidden, archived,  issuedBy, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (doc.docID, doc.doc, doc.docType, doc.category, doc.status, doc.expiry.isoformat() if doc.expiry else None, 
         doc.docName, doc.issueDate.isoformat(), doc.uploadDate.isoformat(), doc.hidden, doc.archived, doc.issuedBy, user_id)
    )
    doc_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return Document(id=doc_id, user_id=user_id, **doc.model_dump())

def calculate_status(expiry_str: Optional[str]) -> str:
    if not expiry_str:
        return "VALID"
    try:
        from datetime import datetime, timedelta
        expiry_date = datetime.fromisoformat(expiry_str).date() if 'T' in expiry_str else datetime.strptime(expiry_str, "%Y-%m-%d").date()
        today = datetime.now().date()
        
        if expiry_date < today:
            return "EXPIRED"
        elif expiry_date <= today + timedelta(days=90):
            return "EXPIRING"
        else:
            return "VALID"
    except Exception:
        return "VALID" # Fallback

def get_documents(user_id: int, archived: bool = False) -> List[DocumentSummary]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, docID, docType, category, status, expiry, docName, issueDate, uploadDate, hidden, archived, issuedBy, user_id,
        LENGTH(doc) as docSize
        FROM documents 
        WHERE user_id = ? AND archived = ?
    ''', (user_id, archived))
    rows = cursor.fetchall()
    
    results = []
    updates_made = False

    from datetime import datetime

    for row in rows:
        d = dict(row)
        try:
            # Parse expiry date
            expiry_val = d['expiry']
            expiry_date = None
            if expiry_val:
                if isinstance(expiry_val, str):
                    # Handle potential Z suffix or other ISO variations
                    expiry_date = datetime.fromisoformat(expiry_val.replace('Z', '+00:00'))
                else:
                    expiry_date = expiry_val

            if expiry_date:
                today = datetime.now()
                # Ensure we compare date objects to avoid time component issues
                today_date = today.date() if isinstance(today, datetime) else today
                expiry_d = expiry_date.date() if isinstance(expiry_date, datetime) else expiry_date
                
                delta_days = (expiry_d - today_date).days

                new_status = "VALID"
                if delta_days < 0:
                     new_status = "EXPIRED"
                elif delta_days <= 90:
                     new_status = "EXPIRING"
            else:
                # No expiry date = Unlimited validity
                new_status = "VALID"

            # Update if different
            if d['status'] != new_status:
                cursor.execute('UPDATE documents SET status = ? WHERE id = ? AND user_id = ?', (new_status, d['id'], user_id))
                d['status'] = new_status
                updates_made = True
        except Exception as e:
            print(f"Error checking status for doc {d.get('id')}: {e}")
            # Fallback to existing status if error
            pass

        results.append(DocumentSummary(**d))

    if updates_made:
        conn.commit()

    conn.close()

    return results

def update_document(doc_id: int, user_id: int, updates: dict) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Filter allowed fields
    allowed_fields = {'docName', 'docType', 'issuedBy', 'issueDate', 'expiry', 'category'}
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if not filtered_updates:
        return False

    set_clause = ", ".join([f"{key} = ?" for key in filtered_updates.keys()])
    values = list(filtered_updates.values())
    values.append(doc_id)
    values.append(user_id)
    
    cursor.execute(f'UPDATE documents SET {set_clause} WHERE id = ? AND user_id = ?', values)
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0

def get_document_by_id(doc_id: int, user_id: int) -> Optional[Document]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM documents WHERE id = ? AND user_id = ?', (doc_id, user_id))
    row = cursor.fetchone()
    conn.close()
    if row:
        return Document(**dict(row))
    return None

def delete_document(doc_id: int, user_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM documents WHERE id = ? AND user_id = ?', (doc_id, user_id))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0

def toggle_archive_status(doc_id: int, user_id: int, archived: bool) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE documents SET archived = ? WHERE id = ? AND user_id = ?', (archived, doc_id, user_id))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0
