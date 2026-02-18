import sqlite3
import os
import sys
import platform
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
            hidden BOOLEAN,
            archived BOOLEAN DEFAULT 0,
            user_id INTEGER
        )
    ''')

    # Check for user_id in certificates and migrate
    cursor.execute("PRAGMA table_info(certificates)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'user_id' not in columns:
        try:
            cursor.execute("ALTER TABLE certificates ADD COLUMN user_id INTEGER")
            print("Migrated: Added column user_id to certificates")
        except Exception as e:
            print(f"Migration error for certificates user_id: {e}")
    
    if 'archived' not in columns:
        try:
            cursor.execute("ALTER TABLE documents ADD COLUMN archived BOOLEAN DEFAULT 0")
            print("Migrated: Added column archived to documents")
        except Exception as e:
            print(f"Migration error for documents archived: {e}")

    # Check for issuedBy in documents and migrate
    if 'issuedBy' not in columns:
        try:
            cursor.execute("ALTER TABLE documents ADD COLUMN issuedBy TEXT DEFAULT 'Self'")
            print("Migrated: Added column issuedBy to documents")
        except Exception as e:
            print(f"Migration error for documents issuedBy: {e}")

    # Create Profiles Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT DEFAULT '',
            last_name TEXT DEFAULT '',
            middle_name TEXT DEFAULT '',
            nationality TEXT DEFAULT '',
            place_of_birth TEXT DEFAULT '',
            date_available TEXT DEFAULT '',
            email TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            job_title TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            avatar_url TEXT DEFAULT '',
            skills TEXT DEFAULT '[]',
            password_hash TEXT DEFAULT '',
            dob TEXT DEFAULT '',
            gender TEXT DEFAULT '',
            permanent_address TEXT DEFAULT '{}',
            present_address TEXT DEFAULT '{}',
            next_of_kin TEXT DEFAULT '{}',
            physical_description TEXT DEFAULT '{}',
            rank TEXT DEFAULT '',
            department TEXT DEFAULT ''
        )
    ''')
    
    # Check for missing columns and migrate
    cursor.execute("PRAGMA table_info(profiles)")
    columns = [info[1] for info in cursor.fetchall()]
    
    new_columns = {
        'middle_name': "TEXT DEFAULT ''",
        'nationality': "TEXT DEFAULT ''",
        'place_of_birth': "TEXT DEFAULT ''",
        'date_available': "TEXT DEFAULT ''",
        'dob': "TEXT DEFAULT ''",
        'gender': "TEXT DEFAULT ''",
        'password_hash': "TEXT DEFAULT ''",
        'permanent_address': "TEXT DEFAULT '{}'",
        'present_address': "TEXT DEFAULT '{}'",
        'next_of_kin': "TEXT DEFAULT '{}'",
        'physical_description': "TEXT DEFAULT '{}'",
        'rank': "TEXT DEFAULT ''",
        'department': "TEXT DEFAULT ''"
    }

    for col_name, col_def in new_columns.items():
        if col_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_def}")
                print(f"Migrated: Added column {col_name} to profiles")
            except Exception as e:
                print(f"Migration error for {col_name}: {e}")
    
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
            dept TEXT DEFAULT 'ENGINE',
            mainEngine TEXT,
            bhp REAL,
            kw REAL,
            torque REAL,
            dwt REAL,
            rank TEXT,
            signOn TEXT,
            signOff TEXT,
            uploadDate TEXT,
            user_id INTEGER
        )
    ''')

    # Migrate sea_time_logs table - add dept column if missing
    cursor.execute("PRAGMA table_info(sea_time_logs)")
    stl_columns = {col[1] for col in cursor.fetchall()}
    if 'dept' not in stl_columns:
        try:
            cursor.execute("ALTER TABLE sea_time_logs ADD COLUMN dept TEXT DEFAULT 'ENGINE'")
            print("Migrated: Added column dept to sea_time_logs")
        except Exception as e:
            print(f"Migration error for dept: {e}")

    # Migrate sea_time_logs table - add kw column if missing
    cursor.execute("PRAGMA table_info(sea_time_logs)")
    stl_columns = {col[1] for col in cursor.fetchall()}
    if 'kw' not in stl_columns:
        try:
            cursor.execute("ALTER TABLE sea_time_logs ADD COLUMN kw REAL")
            print("Migrated: Added column kw to sea_time_logs")
            # Populate kw from bhp (approx conversion) or torque if available
            cursor.execute("UPDATE sea_time_logs SET kw = bhp * 0.7457 WHERE kw IS NULL AND bhp IS NOT NULL")
        except Exception as e:
            print(f"Migration error for kw: {e}")
    
    # Check if user_id column exists in sea_time_logs (migration)
    cursor.execute("PRAGMA table_info(sea_time_logs)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'user_id' not in columns:
        cursor.execute("ALTER TABLE sea_time_logs ADD COLUMN user_id INTEGER")
        
    # Check if dept column exists
    if 'dept' not in columns:
        cursor.execute("ALTER TABLE sea_time_logs ADD COLUMN dept TEXT")

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
            hidden BOOLEAN,
            archived BOOLEAN DEFAULT 0,
            user_id INTEGER
        )
    ''')

    # Check for user_id in documents and migrate
    cursor.execute("PRAGMA table_info(documents)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'user_id' not in columns:
        try:
            cursor.execute("ALTER TABLE documents ADD COLUMN user_id INTEGER")
            print("Migrated: Added column user_id to documents")
        except Exception as e:
            print(f"Migration error for documents user_id: {e}")

    # Check for archived in documents and migrate
    if 'archived' not in columns:
        try:
            cursor.execute("ALTER TABLE documents ADD COLUMN archived BOOLEAN DEFAULT 0")
            print("Migrated: Added column archived to documents")
        except Exception as e:
            print(f"Migration error for documents archived: {e}")

    # Check for issuedBy in documents and migrate
    if 'issuedBy' not in columns:
        try:
            cursor.execute("ALTER TABLE documents ADD COLUMN issuedBy TEXT DEFAULT 'Self'")
            print("Migrated: Added column issuedBy to documents")
        except Exception as e:
            print(f"Migration error for documents issuedBy: {e}")

    # Seed Default Profile if empty
    cursor.execute('SELECT count(*) FROM profiles')
    if cursor.fetchone()[0] == 0:
        default_password = get_password_hash("password123")
        cursor.execute('''
            INSERT INTO profiles (first_name, last_name, email, phone, job_title, bio, skills, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('John', 'Doe', 'john.doe@example.com', '+1 (555) 0123', 'Marine Engineer', 'Experienced marine engineer.', '["Safety Management", "Navigation", "First Aid"]', default_password))

     # Create Document Categories Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS document_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL,
            pattern TEXT,
            user_id INTEGER,
            is_system BOOLEAN DEFAULT 0,
            scope TEXT DEFAULT 'document'
        )
    ''')

    # Migrate document_categories - add scope column if missing
    cursor.execute("PRAGMA table_info(document_categories)")
    dc_columns = {col[1] for col in cursor.fetchall()}
    if 'scope' not in dc_columns:
        try:
            cursor.execute("ALTER TABLE document_categories ADD COLUMN scope TEXT DEFAULT 'document'")
            print("Migrated: Added column scope to document_categories")
        except Exception as e:
            print(f"Migration error for scope: {e}")

    # Seed Default Categories if empty (for documents)
    cursor.execute("SELECT count(*) FROM document_categories WHERE scope = 'document'")
    if cursor.fetchone()[0] == 0:
        default_categories = [
            ('Medical', 'emerald', 'Stethoscope', 'medical|health|fever', 1, 1, 'document'),
            ('Safety', 'orange', 'Anchor', 'safety|stcw|fire|security', 1, 1, 'document'),
            ('Travel', 'blue', 'Plane', 'passport|visa|book|seaman|travel', 1, 1, 'document'),
            ('Tech', 'purple', 'Wrench', 'technical|engineering|mechanical|repair', 1, 1, 'document')
        ]
        cursor.executemany('''
            INSERT INTO document_categories (label, color, icon, pattern, user_id, is_system, scope)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', default_categories)
        print("Seeded default document categories")

    # Seed Default Categories if empty (for certificates)
    cursor.execute("SELECT count(*) FROM document_categories WHERE scope = 'certificate'")
    if cursor.fetchone()[0] == 0:
        cert_categories = [
            ('CoC', 'orange', 'Award', 'coc|competency|certificate of competency', 1, 1, 'certificate'),
            ('STCW', 'blue', 'Anchor', 'stcw|training|safety', 1, 1, 'certificate'),
            ('Medical', 'emerald', 'Stethoscope', 'medical|health', 1, 1, 'certificate'),
            ('License', 'purple', 'FileText', 'license|endorsement', 1, 1, 'certificate'),
            ('Other', 'zinc', 'File', 'other|misc', 1, 1, 'certificate')
        ]
        cursor.executemany('''
            INSERT INTO document_categories (label, color, icon, pattern, user_id, is_system, scope)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', cert_categories)
        print("Seeded default certificate categories")

    conn.commit()
    conn.close()

    # Create Resume Drafts Table
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_drafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check for user_id in resume_drafts and migrate (just in case, though likely new)
    cursor.execute("PRAGMA table_info(resume_drafts)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'user_id' not in columns:
        try:
            cursor.execute("ALTER TABLE resume_drafts ADD COLUMN user_id INTEGER")
            print("Migrated: Added column user_id to resume_drafts")
        except Exception as e:
            print(f"Migration error for resume_drafts user_id: {e}")

    conn.commit()
    conn.close()
