import uvicorn
import sys
import os

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current dir: {current_dir}")
sys.path.append(current_dir)

if __name__ == "__main__":
    try:
        from backend.main import app
        print("Imported app successfully")
        uvicorn.run(app, host="127.0.0.1", port=8000)
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()
