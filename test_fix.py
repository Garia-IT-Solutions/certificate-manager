from backend.models.profile import Profile
from datetime import datetime
import json

data = {
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "dob": "",
    "id": 1
}

try:
    p = Profile(**data)
    print("Success: dob is", p.dob)
except Exception as e:
    print("Failed:", e)
