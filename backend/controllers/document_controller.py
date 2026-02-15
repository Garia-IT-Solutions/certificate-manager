import sqlite3
from backend.database import get_db_connection
from backend.models.document import Document, DocumentCreate, DocumentSummary
from typing import List, Optional

def create_document(doc: DocumentCreate, user_id: int) -> Document:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO documents (docID, doc, docType, category, status, expiry, docName, issueDate, uploadDate, hidden, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (doc.docID, doc.doc, doc.docType, doc.category, doc.status, doc.expiry.isoformat() if doc.expiry else None, 
         doc.docName, doc.issueDate.isoformat(), doc.uploadDate.isoformat(), doc.hidden, user_id)
    )
    doc_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return Document(id=doc_id, user_id=user_id, **doc.model_dump())

def get_documents(user_id: int) -> List[DocumentSummary]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, docID, docType, category, status, expiry, docName, issueDate, uploadDate, hidden, user_id,
        LENGTH(doc) as docSize
        FROM documents 
        WHERE user_id = ?
    ''', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    if not rows:
        return []
    return [DocumentSummary(**dict(row)) for row in rows]

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
