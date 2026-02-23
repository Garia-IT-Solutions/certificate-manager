import sys
import os

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current dir: {current_dir}")
sys.path.append(current_dir)

try:
    from backend.database import init_db
    print("Imported init_db")
    init_db()
    print("init_db executed successfully")
except Exception as e:
    print(f"Error executing init_db: {e}")
    import traceback
    traceback.print_exc()
