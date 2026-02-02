import sqlite3
import json
from typing import Optional
from backend.database import get_db_connection
from backend.models.profile import Profile, ProfileUpdate, ProfileCreate
from backend.utils.security import get_password_hash

def get_profile(profile_id: int = 1) -> Optional[Profile]:
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

def get_profile_by_email(email: str) -> Optional[dict]:
    # Returns dict including password_hash for auth verification
    conn = get_db_connection()
    profile = conn.execute('SELECT * FROM profiles WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if profile:
        profile_dict = dict(profile)
        # Parse skills from JSON string
        try:
            profile_dict['skills'] = json.loads(profile_dict['skills'])
        except:
            profile_dict['skills'] = []
        return profile_dict
    return None

def create_profile(profile_data: ProfileCreate) -> Profile:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    hashed_password = get_password_hash(profile_data.password)
    
    cursor.execute('''
        INSERT INTO profiles (first_name, last_name, email, phone, job_title, bio, skills, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        profile_data.first_name, 
        profile_data.last_name, 
        profile_data.email, 
        profile_data.phone, 
        profile_data.job_title, 
        profile_data.bio, 
        json.dumps(profile_data.skills),
        hashed_password
    ))
    
    profile_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return get_profile(profile_id)

def update_profile(profile_data: ProfileUpdate, profile_id: int = 1) -> Profile:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Filter out None values to only update provided fields
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if 'skills' in update_data:
        update_data['skills'] = json.dumps(update_data['skills'])
        
    if 'password' in update_data:
        update_data['password_hash'] = get_password_hash(update_data.pop('password'))

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
