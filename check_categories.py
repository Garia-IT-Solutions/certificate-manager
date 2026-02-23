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

print("\n--- Categories ---")
try:
    cursor.execute("SELECT id, label, scope, is_system FROM document_categories")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Label: {row[1]}, Scope: {row[2]}, Is System: {row[3]}")
except Exception as e:
    print(f"Error checking categories: {e}")

conn.close()
