from datetime import datetime, timedelta
from backend.database import get_db_connection
from typing import Dict, Any, List

def get_dashboard_summary(user_id: int) -> Dict[str, Any]:
    """Aggregate data from all tables for dashboard display."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # --- SEA TIME STATS ---
    cursor.execute('SELECT * FROM sea_time_logs WHERE user_id = ? ORDER BY signOff DESC', (user_id,))
    sea_logs = cursor.fetchall()
    
    total_days = 0
    last_vessel = None
    last_rank = None
    recent_voyages = []
    
    for row in sea_logs:
        log = dict(row)
        try:
            sign_on = datetime.fromisoformat(log['signOn'].replace('Z', '+00:00'))
            sign_off = datetime.fromisoformat(log['signOff'].replace('Z', '+00:00'))
            days = (sign_off - sign_on).days
            total_days += max(0, days)
            
            if last_vessel is None:
                last_vessel = log['vesselName']
                last_rank = log['rank']
            
            if len(recent_voyages) < 3:
                recent_voyages.append({
                    'vesselName': log['vesselName'],
                    'type': log['type'],
                    'dwt': log['dwt'],
                    'days': days,
                    'signOff': log['signOff'],
                    'rank': log['rank']
                })
        except Exception as e:
            print(f"Error parsing sea log: {e}")
    
    sea_time_stats = {
        'totalDays': total_days,
        'lastVessel': last_vessel,
        'lastRank': last_rank,
        'recentVoyages': recent_voyages
    }
    
    # --- CERTIFICATE STATS ---
    cursor.execute('SELECT * FROM certificates WHERE user_id = ?', (user_id,))
    certs = cursor.fetchall()
    
    valid_certs = 0
    expiring_certs = 0
    expired_certs = 0
    cert_alerts = []
    
    for row in certs:
        cert = dict(row)
        status = cert.get('status', 'VALID')
        if status == 'VALID':
            valid_certs += 1
        elif status == 'EXPIRING':
            expiring_certs += 1
            # Check if expiring within 30 days for alerts
            try:
                expiry = datetime.fromisoformat(cert['expiry'].replace('Z', '+00:00'))
                if (expiry - datetime.now()).days <= 30:
                    cert_alerts.append({
                        'type': 'certificate',
                        'name': cert['certName'],
                        'expiryDate': cert['expiry'],
                        'daysRemaining': (expiry - datetime.now()).days
                    })
            except:
                pass
        else:
            expired_certs += 1
    
    total_certs = valid_certs + expiring_certs + expired_certs
    cert_compliance = round((valid_certs / total_certs * 100)) if total_certs > 0 else 100
    
    certificate_stats = {
        'total': total_certs,
        'valid': valid_certs,
        'expiring': expiring_certs,
        'expired': expired_certs,
        'compliancePercent': cert_compliance
    }
    
    # --- DOCUMENT STATS ---
    cursor.execute('SELECT * FROM documents WHERE user_id = ?', (user_id,))
    docs = cursor.fetchall()
    
    valid_docs = 0
    expiring_docs = 0
    expired_docs = 0
    doc_alerts = []
    
    for row in docs:
        doc = dict(row)
        status = doc.get('status', 'VALID')
        if status == 'VALID':
            valid_docs += 1
        elif status == 'EXPIRING':
            expiring_docs += 1
            try:
                expiry = datetime.fromisoformat(doc['expiry'].replace('Z', '+00:00'))
                if (expiry - datetime.now()).days <= 30:
                    doc_alerts.append({
                        'type': 'document',
                        'name': doc['docName'],
                        'expiryDate': doc['expiry'],
                        'daysRemaining': (expiry - datetime.now()).days
                    })
            except:
                pass
        else:
            expired_docs += 1
    
    total_docs = valid_docs + expiring_docs + expired_docs
    
    document_stats = {
        'total': total_docs,
        'valid': valid_docs,
        'expiring': expiring_docs,
        'expired': expired_docs,
        'recent': []
    }

    # Get 3 most recently uploaded documents
    cursor.execute('SELECT * FROM documents WHERE user_id = ? ORDER BY uploadDate DESC LIMIT 3', (user_id,))
    recent_docs_rows = cursor.fetchall()
    
    for row in recent_docs_rows:
        d = dict(row)
        document_stats['recent'].append({
            'name': d['docName'],
            'status': d.get('status', 'VALID'),
            'expiryDate': d['expiry'],
            'uploadDate': d['uploadDate']
        })
    
    
    # --- NRI STATUS CALCULATION ---
    # Logic: "last year's March 31st to the current March 31st"
    # If today is before or on Mar 31st, the period ends on THIS year's Mar 31st.
    # If today is after Mar 31st, the period ends on NEXT year's Mar 31st.
    
    today = datetime.now()
    current_year = today.year
    
    if today.month < 3 or (today.month == 3 and today.day <= 31):
        # Jan 1 - Mar 31: Period is Previous Mar 31 to Current Mar 31
        end_date = datetime(current_year, 3, 31)
        start_date = datetime(current_year - 1, 3, 31)
    else:
        # Apr 1 - Dec 31: Period is Current Mar 31 to Next Mar 31
        end_date = datetime(current_year + 1, 3, 31)
        start_date = datetime(current_year, 3, 31)
        
    nri_days = 0
    
    # Re-iterate sea logs or optimize by doing it in the first loop? 
    # Doing it separately for clarity as the first loop calculates total life-time days.
    
    for row in sea_logs:
        log = dict(row)
        try:
            sign_on = datetime.fromisoformat(log['signOn'].replace('Z', '+00:00')).replace(tzinfo=None) # naive comparison
            sign_off = datetime.fromisoformat(log['signOff'].replace('Z', '+00:00')).replace(tzinfo=None)
            
            # Intersection of [sign_on, sign_off] and [start_date, end_date]
            overlap_start = max(sign_on, start_date)
            overlap_end = min(sign_off, end_date)
            
            if overlap_start < overlap_end:
                 days = (overlap_end - overlap_start).days
                 nri_days += days
        except Exception as e:
            pass # Already logged in previous loop if error
            
    nri_status = {
        'days': nri_days,
        'startDate': start_date.strftime('%d %b %Y'),
        'endDate': end_date.strftime('%d %b %Y'),
        'isRetained': nri_days > 182,
        'daysRemaining': max(0, 183 - nri_days)
    }

    # --- COMBINE ALERTS (sorted by urgency) ---
    all_alerts = cert_alerts + doc_alerts
    all_alerts.sort(key=lambda x: x['daysRemaining'])
    
    conn.close()
    
    return {
        'seaTime': sea_time_stats,
        'certificates': certificate_stats,
        'documents': document_stats,
        'alerts': all_alerts[:5],
        'nriStatus': nri_status
    }
