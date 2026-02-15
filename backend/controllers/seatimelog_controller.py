import sqlite3
from backend.database import get_db_connection
from backend.models.seatimelog import SeaTimeLog, SeaTimeLogCreate
from typing import List, Optional

def create_seatimelog(log: SeaTimeLogCreate, user_id: int) -> SeaTimeLog:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO sea_time_logs (imo, offNo, flag, vesselName, type, company, dept, mainEngine, bhp, torque, dwt, rank, signOn, signOff, uploadDate, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (log.imo, log.offNo, log.flag, log.vesselName, log.type, log.company, log.dept or "ENGINE",
         log.mainEngine or "", log.bhp or 0, log.torque or 0, log.dwt, log.rank, 
         log.signOn.isoformat(), log.signOff.isoformat(), log.uploadDate.isoformat(), user_id)
    )
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return SeaTimeLog(id=log_id, user_id=user_id, **log.model_dump())

def get_seatimelogs(user_id: int) -> List[SeaTimeLog]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM sea_time_logs WHERE user_id = ?', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    if not rows:
        return []
    return [SeaTimeLog(**dict(row)) for row in rows]

def get_seatimelog_by_id(log_id: int, user_id: int) -> Optional[SeaTimeLog]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM sea_time_logs WHERE id = ? AND user_id = ?', (log_id, user_id))
    row = cursor.fetchone()
    conn.close()
    if row:
        return SeaTimeLog(**dict(row))
    return None

def delete_seatimelog(log_id: int, user_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM sea_time_logs WHERE id = ? AND user_id = ?', (log_id, user_id))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0
