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
print(f"Checking DB at: {db_path}")

if not os.path.exists(db_path):
    print("Database file not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])

if 'document_categories' in [t[0] for t in tables]:
    print("document_categories table exists.")
    cursor.execute("PRAGMA table_info(document_categories)")
    columns = cursor.fetchall()
    print("Columns:", [c[1] for c in columns])
else:
    print("document_categories table MISSING!")

conn.close()
