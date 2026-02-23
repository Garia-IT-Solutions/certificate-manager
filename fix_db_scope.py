import sqlite3
import os
import platform

def get_db_path():
    app_name = "MarineTrackerPro"
    if platform.system() == "Windows":
        app_data = os.getenv("APPDATA")
        if not app_data:
            app_data = os.path.expanduser("~\\AppData\\Roaming")
        data_dir = os.path.join(app_data, app_name)
    else:
        app_data = os.path.expanduser("~/.local/share")
        data_dir = os.path.join(app_data, app_name)
    return os.path.join(data_dir, "certmanager.db")

db_path = get_db_path()
print(f"Fixing DB at: {db_path}")

if not os.path.exists(db_path):
    print("Database file not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Check/Add scope column
print("Checking for 'scope' column in 'document_categories'...")
cursor.execute("PRAGMA table_info(document_categories)")
columns = {col[1] for col in cursor.fetchall()}

if 'scope' not in columns:
    print("Adding 'scope' column...")
    try:
        cursor.execute("ALTER TABLE document_categories ADD COLUMN scope TEXT DEFAULT 'document'")
        print("Success: Added 'scope' column.")
    except Exception as e:
        print(f"Error adding column: {e}")
else:
    print("'scope' column already exists.")

# 2. Ensure existing rows have 'document' scope
print("Updating existing categories to default scope 'document'...")
cursor.execute("UPDATE document_categories SET scope = 'document' WHERE scope IS NULL OR scope = ''")
print(f"Updated {cursor.rowcount} rows.")

# 3. Add default 'certificate' categories if missing
print("Checking for 'certificate' categories...")
cursor.execute("SELECT count(*) FROM document_categories WHERE scope = 'certificate'")
count = cursor.fetchone()[0]

if count == 0:
    print("Seeding default 'certificate' categories...")
    # user_id 1 is assumed for single user app
    cert_categories = [
        ('CoC', 'orange', 'Award', 'coc|competency|certificate of competency', 1, 1, 'certificate'),
        ('STCW', 'blue', 'Anchor', 'stcw|training|safety', 1, 1, 'certificate'),
        ('Medical', 'emerald', 'Stethoscope', 'medical|health', 1, 1, 'certificate'),
        ('License', 'purple', 'FileText', 'license|endorsement', 1, 1, 'certificate'),
        ('Other', 'zinc', 'FileText', 'other|misc', 1, 1, 'certificate')
    ]
    cursor.executemany('''
        INSERT INTO document_categories (label, color, icon, pattern, user_id, is_system, scope)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', cert_categories)
    print(f"Seeded {len(cert_categories)} certificate categories.")
else:
    print(f"Found {count} certificate categories.")

conn.commit()
conn.close()
print("Database fix completed.")
