import sqlite3

def check_db():
    try:
        conn = sqlite3.connect('certmanager.db')
        cursor = conn.cursor()
        
        print("--- Documents Table Info ---")
        cursor.execute("PRAGMA table_info(documents)")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
            
        print("\n--- Certificates Table Info ---")
        cursor.execute("PRAGMA table_info(certificates)")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
