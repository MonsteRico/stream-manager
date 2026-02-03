import requests

BASE_URL = "https://stream-manager.matthewgardner.dev"
SESSION_ID = "REPLACE_ME"

response = requests.post(
    f"{BASE_URL}/api/sessions/{SESSION_ID}/updateMap",
    json={"mapName": "Nepal"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
