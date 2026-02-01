import sqlite3
from backend.database import get_db_connection
from backend.models.document import Document, DocumentCreate

def create_document(doc: DocumentCreate) -> Document:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO documents (docID, doc, docType, category, status, expiry, docName, issueDate, uploadDate, hidden)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        doc.docID, doc.doc, doc.docType, doc.category, doc.status, 
        doc.expiry.isoformat(), doc.docName, doc.issueDate.isoformat(), 
        doc.uploadDate.isoformat(), doc.hidden
    ))
    
    doc_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return get_document_by_id(doc_id)

def get_documents() -> list[Document]:
    conn = get_db_connection()
    docs = conn.execute('SELECT * FROM documents').fetchall()
    conn.close()
    return [Document(**dict(doc)) for doc in docs]

def get_document_by_id(doc_id: int) -> Document:
    conn = get_db_connection()
    doc = conn.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone()
    conn.close()
    if doc:
        return Document(**dict(doc))
    return None

def delete_document(doc_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM documents WHERE id = ?', (doc_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
