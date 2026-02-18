import sqlite3
from backend.utils.security import get_password_hash
from datetime import datetime
import os

DB_PATH = "certmanager.db"

def create_engine_user():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    email = "engineer@test.com"
    password = "password"
    hashed_password = get_password_hash(password)
    
    # Check if user exists
    cursor.execute("SELECT id FROM profiles WHERE email = ?", (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        print(f"User {email} already exists with ID {existing_user[0]}. Skipping creation.")
        user_id = existing_user[0]
    else:
        cursor.execute('''
            INSERT INTO profiles (email, password_hash, first_name, last_name, department, rank)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (email, hashed_password, "Test", "Engineer", "ENGINE", "Chief Engineer"))
        user_id = cursor.lastrowid
        print(f"Created user {email} with ID {user_id}")

    # Add dummy sea time logs
    logs = [
        {
            "imo": "9876543", "offNo": "12345", "flag": "Panama", "vesselName": "ENGINEER TEST 1",
            "type": "Oil Tanker", "company": "Test Shipping", "dept": "ENGINE",
            "mainEngine": "MAN B&W 6G70ME-C9.5", "bhp": 25000, "kw": 18642, "dwt": 150000,
            "rank": "Second Engineer", "signOn": "2023-01-01", "signOff": "2023-06-01",
            "uploadDate": datetime.now().isoformat()
        },
        {
            "imo": "1234567", "offNo": "67890", "flag": "Liberia", "vesselName": "ENGINEER TEST 2",
            "type": "Gas Tanker", "company": "Global Gas", "dept": "ENGINE",
            "mainEngine": "Wartsila 6L50DF", "bhp": 15000, "kw": 11185, "dwt": 80000,
            "rank": "Chief Engineer", "signOn": "2023-08-01", "signOff": "2024-01-01",
            "uploadDate": datetime.now().isoformat()
        }
    ]

    for log in logs:
        # Check if log exists to avoid duplicates (silly check by vessel name and signOn)
        cursor.execute("SELECT id FROM sea_time_logs WHERE user_id = ? AND vesselName = ? AND signOn = ?", 
                       (user_id, log["vesselName"], log["signOn"]))
        if not cursor.fetchone():
            cursor.execute('''
                INSERT INTO sea_time_logs (
                    imo, offNo, flag, vesselName, type, company, dept, 
                    mainEngine, bhp, kw, dwt, rank, signOn, signOff, uploadDate, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                log["imo"], log["offNo"], log["flag"], log["vesselName"], log["type"], log["company"], log["dept"],
                log["mainEngine"], log["bhp"], log["kw"], log["dwt"], log["rank"], log["signOn"], log["signOff"],
                log["uploadDate"], user_id
            ))
            print(f"Added log for {log['vesselName']}")
        else:
             print(f"Log for {log['vesselName']} already exists.")

    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    create_engine_user()
