import requests

BASE_URL = "https://stream-manager.matthewgardner.dev"
SESSION_ID = "d10b877f-5a9b-471a-99bd-c927e1549e11"

response = requests.post(
    f"{BASE_URL}/api/{SESSION_ID}/updateMap",
    json={"mapName": "New Junk City"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
