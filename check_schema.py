import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend/database.db')

def check_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    print(f"Checking database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables found:", [t[0] for t in tables])

    for table in tables:
        table_name = table[0]
        print(f"\nSchema for {table_name}:")
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        for col in columns:
            print(col)

    conn.close()

if __name__ == "__main__":
    check_schema()
