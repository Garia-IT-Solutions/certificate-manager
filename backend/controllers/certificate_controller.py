from typing import List, Optional
from backend.database import get_db_connection
from backend.models.certificate import Certificate, CertificateCreate, CertificateUpdate, CertificateSummary
import sqlite3
from datetime import datetime

def create_certificate(cert: CertificateCreate, user_id: int) -> Certificate:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO certificates (cert, certType, issuedBy, status, expiry, certName, issueDate, uploadDate, hidden, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (cert.cert, cert.certType, cert.issuedBy, cert.status, cert.expiry_date.isoformat() if cert.expiry_date else None, 
         cert.certName, cert.issueDate.isoformat() if cert.issueDate else None, cert.uploadDate.isoformat() if cert.uploadDate else None, cert.hidden, user_id)
    )
    cert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return Certificate(id=cert_id, user_id=user_id, **cert.model_dump())

def update_certificate(cert_id: int, cert_update: CertificateUpdate, user_id: int) -> Optional[Certificate]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Filter out None values to update only provided fields
    update_data = {k: v for k, v in cert_update.model_dump().items() if v is not None}
    
    if not update_data:
        conn.close()
        return get_certificate_by_id(cert_id, user_id)

    # Convert datetime objects to isoformat strings
    for key, value in update_data.items():
        if isinstance(value, datetime):
            update_data[key] = value.isoformat()

    set_clause = ', '.join([f"{key} = ?" for key in update_data.keys()])
    values = list(update_data.values())
    values.append(cert_id)
    values.append(user_id)

    cursor.execute(f'UPDATE certificates SET {set_clause} WHERE id = ? AND user_id = ?', values)
    conn.commit()
    
    rows_affected = cursor.rowcount
    conn.close()
    
    if rows_affected > 0:
        return get_certificate_by_id(cert_id, user_id)
    return None

def get_certificates(user_id: int) -> List[CertificateSummary]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM certificates WHERE user_id = ?', (user_id,))
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        return []

    certificates = []
    updates_made = False
    
    for row in rows:
        cert_dict = dict(row)
        try:
            # Parse expiry date
            expiry_val = cert_dict['expiry']
            expiry_date = None
            if expiry_val:
                if isinstance(expiry_val, str):
                    # Handle potential Z suffix or other ISO variations if needed
                    expiry_date = datetime.fromisoformat(expiry_val.replace('Z', '+00:00'))
                else:
                    expiry_date = expiry_val
                
            # Calculate updated status
            new_status = cert_dict['status']
            
            if expiry_date:
                today = datetime.now()
                if expiry_date.tzinfo:
                    today = today.astimezone()
    
                delta = expiry_date - today
                
                new_status = "VALID"
                if delta.total_seconds() < 0:
                     new_status = "EXPIRED"
                elif delta.days <= 120:
                     new_status = "EXPIRING"
            else:
                # No expiry date = Unlimited validity
                new_status = "VALID"
            
            # Update if different
            if cert_dict['status'] != new_status:
                cursor.execute('UPDATE certificates SET status = ? WHERE id = ? AND user_id = ?', (new_status, cert_dict['id'], user_id))
                cert_dict['status'] = new_status
                updates_made = True
                
        except Exception as e:
            print(f"Error checking status for cert {cert_dict.get('id')}: {e}")

        certificates.append(CertificateSummary(**cert_dict))
    
    if updates_made:
        conn.commit()
        
    conn.close()
    return certificates

def get_certificate_by_id(cert_id: int, user_id: int) -> Optional[Certificate]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM certificates WHERE id = ? AND user_id = ?', (cert_id, user_id))
    row = cursor.fetchone()
    conn.close()
    if row:
        return Certificate(**dict(row))
    return None

def delete_certificate(cert_id: int, user_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM certificates WHERE id = ? AND user_id = ?', (cert_id, user_id))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0
