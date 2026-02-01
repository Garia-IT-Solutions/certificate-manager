import sqlite3
from sqlite3 import Connection

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
            skills TEXT DEFAULT '[]'
        )
    ''')
    
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
        cursor.execute('''
            INSERT INTO profiles (first_name, last_name, email, phone, job_title, bio, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', ('John', 'Doe', 'john.doe@example.com', '+1 (555) 0123', 'Marine Engineer', 'Experienced marine engineer with a passion for safety and compliance.', '["Safety Management", "Navigation", "First Aid"]'))

    conn.commit()
    conn.close()
