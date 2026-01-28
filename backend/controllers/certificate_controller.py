from typing import List, Optional
from backend.database import get_db_connection
from backend.models.certificate import Certificate, CertificateCreate
import sqlite3

def create_certificate(cert: CertificateCreate) -> Certificate:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO certificates (name, domain, issue_date, expiry_date, status) VALUES (?, ?, ?, ?, ?)',
        (cert.name, cert.domain, cert.issue_date, cert.expiry_date, cert.status)
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
    changes = conn.total_changes
    conn.commit()
    conn.close()
    return changes > 0
