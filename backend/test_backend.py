import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_create_certificate():
    url = f"{BASE_URL}/certificates"
    data = {
        "name": "Test Cert",
        "domain": "example.com",
        "issue_date": "2023-01-01",
        "expiry_date": "2024-01-01",
        "status": "active"
    }
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 201:
                print("PASS: Create Certificate")
                return json.loads(response.read().decode())
            else:
                print(f"FAIL: Create Certificate - Status {response.status}")
    except Exception as e:
        print(f"FAIL: Create Certificate - {e}")
    return None

def test_get_certificates():
    url = f"{BASE_URL}/certificates"
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                print("PASS: Get Certificates")
                return json.loads(response.read().decode())
            else:
                print(f"FAIL: Get Certificates - Status {response.status}")
    except Exception as e:
        print(f"FAIL: Get Certificates - {e}")
    return []

def test_get_certificate(cert_id):
    url = f"{BASE_URL}/certificates/{cert_id}"
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                print("PASS: Get Certificate by ID")
                return json.loads(response.read().decode())
            else:
                print(f"FAIL: Get Certificate by ID - Status {response.status}")
    except Exception as e:
        print(f"FAIL: Get Certificate by ID - {e}")

def test_delete_certificate(cert_id):
    url = f"{BASE_URL}/certificates/{cert_id}"
    req = urllib.request.Request(url, method='DELETE')
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 204:
                print("PASS: Delete Certificate")
                return True
            else:
                print(f"FAIL: Delete Certificate - Status {response.status}")
    except Exception as e:
        print(f"FAIL: Delete Certificate - {e}")
    return False

def run_tests():
    print("Running Backend Tests...")
    
    # Create
    cert = test_create_certificate()
    if not cert:
        sys.exit(1)
    
    cert_id = cert['id']
    
    # List
    certs = test_get_certificates()
    if not any(c['id'] == cert_id for c in certs):
        print("FAIL: Created certificate not found in list")
    
    # Get by ID
    test_get_certificate(cert_id)
    
    # Delete
    test_delete_certificate(cert_id)
    
    # Verify Deletion
    try:
        test_get_certificate(cert_id)
        print("FAIL: Certificate should be deleted")
    except:
        # Expected failure or handled in function
        pass 

if __name__ == "__main__":
    run_tests()
