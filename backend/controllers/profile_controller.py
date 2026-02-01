import sqlite3
import json
from backend.database import get_db_connection
from backend.models.profile import Profile, ProfileUpdate

def get_profile(profile_id: int = 1) -> Profile:
    conn = get_db_connection()
    profile = conn.execute('SELECT * FROM profiles WHERE id = ?', (profile_id,)).fetchone()
    conn.close()
    
    if profile:
        profile_dict = dict(profile)
        # Parse skills from JSON string
        try:
            profile_dict['skills'] = json.loads(profile_dict['skills'])
        except:
            profile_dict['skills'] = []
        return Profile(**profile_dict)
    return None

def update_profile(profile_data: ProfileUpdate, profile_id: int = 1) -> Profile:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Filter out None values to only update provided fields
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if 'skills' in update_data:
        update_data['skills'] = json.dumps(update_data['skills'])

    if not update_data:
        conn.close()
        return get_profile(profile_id)

    set_clause = ", ".join([f"{key} = ?" for key in update_data.keys()])
    values = list(update_data.values())
    values.append(profile_id)
    
    cursor.execute(f'UPDATE profiles SET {set_clause} WHERE id = ?', values)
    conn.commit()
    conn.close()
    
    return get_profile(profile_id)
