import requests

BASE_URL = "https://stream-manager.matthewgardner.dev"
SESSION_ID = "REPLACE_ME"

response = requests.post(
    f"{BASE_URL}/api/sessions/{SESSION_ID}/updateScore",
    json={"team": "1", "changeBy": -1}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
