import requests

BASE_URL = "https://stream-manager.matthewgardner.dev"
SESSION_ID = "REPLACE_ME"

response = requests.post(
    f"{BASE_URL}/api/{SESSION_ID}/updateBan",
    json={"team": "2", "characterName": "Mei"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
