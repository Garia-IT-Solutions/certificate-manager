import uvicorn
import multiprocessing
import sys
import os

# Add parent directory to path so 'backend' module is found
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

# Define SafeStream to wrap stdio
class SafeStream:
    def __init__(self, original_stream):
        self._original_stream = original_stream

    def write(self, data):
        if self._original_stream:
            self._original_stream.write(data)

    def flush(self):
        if self._original_stream:
            self._original_stream.flush()

    def isatty(self):
        return False

# Replace stdout/stderr with SafeStream if needed or just patch them
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

# Ensure isatty method exists on stdout/stderr
if not hasattr(sys.stdout, 'isatty'):
    sys.stdout = SafeStream(sys.stdout)
if not hasattr(sys.stderr, 'isatty'):
    sys.stderr = SafeStream(sys.stderr)

# Import main after path adjustment
from backend.main import app

if __name__ == "__main__":
    multiprocessing.freeze_support()
    
    # Configure logging to disable color if stream is not a tty
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    # Remove use_colors key if present to avoid TTY check
    # But uvicorn might re-add it if not specified? 
    # Actually, if we pass log_config, it uses that.
    
    # Run uvicorn with explicit config
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, log_config=log_config)