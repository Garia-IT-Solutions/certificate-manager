import sqlite3
from sqlite3 import Connection
from backend.utils.security import get_password_hash

DATABASE_NAME = "certmanager.db"

def get_db_connection() -> Connection:
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Certificates Table
    # Create Certificates Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cert BLOB,
            certType TEXT,
            issuedBy TEXT,
            status TEXT,
            expiry TEXT,
            certName TEXT,
            issueDate TEXT,
            uploadDate TEXT,
            hidden BOOLEAN
        )
    ''')

    # Create Profiles Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT DEFAULT '',
            last_name TEXT DEFAULT '',
            email TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            job_title TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            avatar_url TEXT DEFAULT '',
            skills TEXT DEFAULT '[]',
            password_hash TEXT DEFAULT ''
        )
    ''')
    
    # Check if password_hash column exists (migration)
    cursor.execute("PRAGMA table_info(profiles)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'password_hash' not in columns:
        cursor.execute("ALTER TABLE profiles ADD COLUMN password_hash TEXT DEFAULT ''")
    
    # Create Sea Time Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sea_time_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            imo INTEGER,
            offNo INTEGER,
            flag TEXT,
            vesselName TEXT,
            type TEXT,
            company TEXT,
            mainEngine TEXT,
            bhp REAL,
            torque REAL,
            dwt REAL,
            rank TEXT,
            signOn TEXT,
            signOff TEXT,
            uploadDate TEXT
        )
    ''')

    # Create Documents Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            docID TEXT,
            doc BLOB,
            docType TEXT,
            category TEXT,
            status TEXT,
            expiry TEXT,
            docName TEXT,
            issueDate TEXT,
            uploadDate TEXT,
            hidden BOOLEAN
        )
    ''')

    # Seed Default Profile if empty
    cursor.execute('SELECT count(*) FROM profiles')
    if cursor.fetchone()[0] == 0:
        default_password = get_password_hash("password123")
        cursor.execute('''
            INSERT INTO profiles (first_name, last_name, email, phone, job_title, bio, skills, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('John', 'Doe', 'john.doe@example.com', '+1 (555) 0123', 'Marine Engineer', 'Experienced marine engineer with a passion for safety and compliance.', '["Safety Management", "Navigation", "First Aid"]', default_password))

    conn.commit()
    conn.close()
