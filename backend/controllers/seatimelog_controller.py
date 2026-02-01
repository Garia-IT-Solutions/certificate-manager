import sqlite3
from backend.database import get_db_connection
from backend.models.seatimelog import SeaTimeLog, SeaTimeLogCreate

def create_seatimelog(log: SeaTimeLogCreate) -> SeaTimeLog:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # insert
    cursor.execute('''
        INSERT INTO sea_time_logs (imo, offNo, flag, vesselName, type, company, mainEngine, bhp, torque, dwt, rank, signOn, signOff, uploadDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        log.imo, log.offNo, log.flag, log.vesselName, log.type, log.company, 
        log.mainEngine, log.bhp, log.torque, log.dwt, log.rank, 
        log.signOn.isoformat(), log.signOff.isoformat(), log.uploadDate.isoformat()
    ))
    
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return get_seatimelog_by_id(log_id)

def get_seatimelogs() -> list[SeaTimeLog]:
    conn = get_db_connection()
    logs = conn.execute('SELECT * FROM sea_time_logs').fetchall()
    conn.close()
    return [SeaTimeLog(**dict(log)) for log in logs]

def get_seatimelog_by_id(log_id: int) -> SeaTimeLog:
    conn = get_db_connection()
    log = conn.execute('SELECT * FROM sea_time_logs WHERE id = ?', (log_id,)).fetchone()
    conn.close()
    if log:
        return SeaTimeLog(**dict(log))
    return None

def delete_seatimelog(log_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM sea_time_logs WHERE id = ?', (log_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
