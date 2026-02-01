from typing import List, Optional
from backend.database import get_db_connection
from backend.models.certificate import Certificate, CertificateCreate
import sqlite3

def create_certificate(cert: CertificateCreate) -> Certificate:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO certificates (cert, certType, issuedBy, status, expiry, certName, issueDate, uploadDate, hidden) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (cert.cert, cert.certType, cert.issuedBy, cert.status, cert.expiry.isoformat(), 
         cert.certName, cert.issueDate.isoformat(), cert.uploadDate.isoformat(), cert.hidden)
    )
    cert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return Certificate(id=cert_id, **cert.model_dump())

def get_certificates() -> List[Certificate]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM certificates')
    rows = cursor.fetchall()
    conn.close()
    return [Certificate(**dict(row)) for row in rows]

def get_certificate_by_id(cert_id: int) -> Optional[Certificate]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM certificates WHERE id = ?', (cert_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return Certificate(**dict(row))
    return None

def delete_certificate(cert_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM certificates WHERE id = ?', (cert_id,))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0
