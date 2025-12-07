# Stream Manager API Examples

This document provides examples of how to use all available API routes for the Stream Manager application.

**Base URL**: Replace `{baseUrl}` with your application URL (e.g., `http://localhost:3000` or `https://your-domain.com`)

**Session ID**: Replace `{sessionId}` with the actual UUID of your session

---

## 1. Get Session Info

Retrieve all information about a session.

**Endpoint**: `GET /api/{sessionId}/sessionInfo`

**Example Request**:
```bash
curl -X GET "{baseUrl}/api/123e4567-e89b-12d3-a456-426614174000/sessionInfo"
```

**Example with JavaScript/Fetch**:
```javascript
const sessionId = "123e4567-e89b-12d3-a456-426614174000";
const response = await fetch(`${baseUrl}/api/${sessionId}/sessionInfo`);
const sessionData = await response.json();
console.log(sessionData);
```

**Example with Python**:
```python
import requests

session_id = "123e4567-e89b-12d3-a456-426614174000"
response = requests.get(f"{base_url}/api/{session_id}/sessionInfo")
session_data = response.json()
print(session_data)
```

**Response**: Returns the complete session object including teams, scores, maps, bans, etc.

---

## 2. Update Score

Update the score for a team. Automatically updates map winners when score increases.

**Endpoint**: `POST /api/{sessionId}/updateScore`

**Request Body**:
```json
{
  "team": "1",
  "changeBy": 1
}
```

**Parameters**:
- `team` (string): Either `"1"` or `"2"` - the team whose score to update
- `changeBy` (number): The amount to change the score by (can be positive or negative)

**Example Request**:
```bash
curl -X POST "{baseUrl}/api/123e4567-e89b-12d3-a456-426614174000/updateScore" \
  -H "Content-Type: application/json" \
  -d '{"team": "1", "changeBy": 1}'
```

**Example with JavaScript/Fetch**:
```javascript
const sessionId = "123e4567-e89b-12d3-a456-426614174000";

// Increase team 1 score by 1
await fetch(`${baseUrl}/api/${sessionId}/updateScore`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    team: "1",
    changeBy: 1
  })
});

// Decrease team 2 score by 1 (undo)
await fetch(`${baseUrl}/api/${sessionId}/updateScore`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    team: "2",
    changeBy: -1
  })
});
```

**Example with Python**:
```python
import requests

session_id = "123e4567-e89b-12d3-a456-426614174000"

# Increase team 1 score by 1
response = requests.post(
    f"{base_url}/api/{session_id}/updateScore",
    json={"team": "1", "changeBy": 1}
)

# Decrease team 2 score by 1
response = requests.post(
    f"{base_url}/api/{session_id}/updateScore",
    json={"team": "2", "changeBy": -1}
)
```

**Notes**:
- When `changeBy > 0`, automatically sets the current map's winner to the specified team
- When `changeBy < 0`, automatically clears the winner of the last completed map
- Frontend automatically updates within 1 second

---

## 3. Flip Sides

Swap team 1 and team 2 information (names, scores, logos, colors, etc.).

**Endpoint**: `POST /api/{sessionId}/flipSides`

**Example Request**:
```bash
curl -X POST "{baseUrl}/api/123e4567-e89b-12d3-a456-426614174000/flipSides"
```

**Example with JavaScript/Fetch**:
```javascript
const sessionId = "123e4567-e89b-12d3-a456-426614174000";

await fetch(`${baseUrl}/api/${sessionId}/flipSides`, {
  method: "POST"
});
```

**Example with Python**:
```python
import requests

session_id = "123e4567-e89b-12d3-a456-426614174000"
response = requests.post(f"{base_url}/api/{session_id}/flipSides")
```

**Notes**:
- Swaps all team data including display names, scores, logos, colors, abbreviations, ranks, and records
- Sets `team1First` to `true`
- Frontend automatically updates within 1 second

---

## 4. Update Map (Overwatch Only)

Update the currently selected map (first map without a winner) for an Overwatch session.

**Endpoint**: `POST /api/{sessionId}/updateMap`

**Request Body**:
```json
{
  "mapName": "King's Row"
}
```

**Parameters**:
- `mapName` (string): The exact name of the map from Overwatch maps list

**Example Request**:
```bash
curl -X POST "{baseUrl}/api/123e4567-e89b-12d3-a456-426614174000/updateMap" \
  -H "Content-Type: application/json" \
  -d '{"mapName": "King'\''s Row"}'
```

**Example with JavaScript/Fetch**:
```javascript
const sessionId = "123e4567-e89b-12d3-a456-426614174000";

await fetch(`${baseUrl}/api/${sessionId}/updateMap`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mapName: "King's Row"
  })
});
```

**Example with Python**:
```python
import requests

session_id = "123e4567-e89b-12d3-a456-426614174000"
response = requests.post(
    f"{base_url}/api/{session_id}/updateMap",
    json={"mapName": "King's Row"}
)
```

**Available Overwatch Maps**:
- Antarctic Peninsula
- Blizzard World
- Busan
- Circuit Royale
- Colosseo
- Dorado
- Eichenwalde
- Esperança
- Gibraltar
- Hanaoka
- Havana
- Hollywood
- Ilios
- Junkertown
- King's Row
- Lijiang Tower
- Midtown
- Nepal
- New Junk City
- New Queen Street
- Numbani
- Oasis
- Paraiso
- Rialto
- Route 66
- Runasapi
- Samoa
- Shambali Monastery
- Suravasa
- Throne of Anubis
- Aatlis

**Error Responses**:
- `400`: Session is not Overwatch, map not found, or no map available to update
- `404`: Session not found

**Notes**:
- Only works for Overwatch sessions
- Updates the first map that doesn't have a winner yet
- Frontend automatically updates within 1 second

---

## 5. Update Ban (Overwatch Only)

Set or clear a hero ban for a team in an Overwatch session.

**Endpoint**: `POST /api/{sessionId}/updateBan`

**Request Body** (Set ban):
```json
{
  "team": "1",
  "characterName": "Genji"
}
```

**Request Body** (Clear ban):
```json
{
  "team": "2",
  "characterName": null
}
```

**Parameters**:
- `team` (string): Either `"1"` or `"2"` - the team whose ban to update
- `characterName` (string | null): The exact name of the character to ban, or `null` to clear the ban

**Example Request** (Set ban):
```bash
curl -X POST "{baseUrl}/api/123e4567-e89b-12d3-a456-426614174000/updateBan" \
  -H "Content-Type: application/json" \
  -d '{"team": "1", "characterName": "Genji"}'
```

**Example Request** (Clear ban):
```bash
curl -X POST "{baseUrl}/api/123e4567-e89b-12d3-a456-426614174000/updateBan" \
  -H "Content-Type: application/json" \
  -d '{"team": "2", "characterName": null}'
```

**Example with JavaScript/Fetch**:
```javascript
const sessionId = "123e4567-e89b-12d3-a456-426614174000";

// Set team 1 ban to Genji
await fetch(`${baseUrl}/api/${sessionId}/updateBan`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    team: "1",
    characterName: "Genji"
  })
});

// Clear team 2 ban
await fetch(`${baseUrl}/api/${sessionId}/updateBan`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    team: "2",
    characterName: null
  })
});
```

**Example with Python**:
```python
import requests

session_id = "123e4567-e89b-12d3-a456-426614174000"

# Set team 1 ban to Genji
response = requests.post(
    f"{base_url}/api/{session_id}/updateBan",
    json={"team": "1", "characterName": "Genji"}
)

# Clear team 2 ban
response = requests.post(
    f"{base_url}/api/{session_id}/updateBan",
    json={"team": "2", "characterName": None}
)
```

**Available Overwatch Characters**:
- **Tank**: D.Va, Doomfist, Junker Queen, Mauga, Orisa, Ramattra, Reinhardt, Roadhog, Sigma, Winston, Wrecking Ball, Zarya
- **Damage**: Ashe, Bastion, Cassidy, Echo, Genji, Hanzo, Junkrat, Mei, Pharah, Reaper, Sojourn, Soldier: 76, Sombra, Symmetra, Torbjörn, Tracer, Venture, Widowmaker
- **Support**: Ana, Baptiste, Brigitte, Freja, Hazard, Illari, Juno, Kiriko, Lifeweaver, Lúcio, Mercy, Moira, Wuyang, Zenyatta

**Error Responses**:
- `400`: Session is not Overwatch, team is not "1" or "2", or character not found
- `404`: Session not found

**Notes**:
- Only works for Overwatch sessions
- Character names must match exactly (case-sensitive)
- Frontend automatically updates within 1 second

---

## Complete Example: Managing a Match

Here's a complete example of managing an Overwatch match via API:

```javascript
const baseUrl = "http://localhost:3000";
const sessionId = "123e4567-e89b-12d3-a456-426614174000";

// 1. Get current session info
const session = await fetch(`${baseUrl}/api/${sessionId}/sessionInfo`).then(r => r.json());
console.log("Current session:", session);

// 2. Set team 1 ban to Genji
await fetch(`${baseUrl}/api/${sessionId}/updateBan`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ team: "1", characterName: "Genji" })
});

// 3. Set team 2 ban to Widowmaker
await fetch(`${baseUrl}/api/${sessionId}/updateBan`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ team: "2", characterName: "Widowmaker" })
});

// 4. Set the current map to King's Row
await fetch(`${baseUrl}/api/${sessionId}/updateMap`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ mapName: "King's Row" })
});

// 5. Team 1 wins the map (increases score)
await fetch(`${baseUrl}/api/${sessionId}/updateScore`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ team: "1", changeBy: 1 })
});

// 6. Set next map to Busan
await fetch(`${baseUrl}/api/${sessionId}/updateMap`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ mapName: "Busan" })
});

// 7. Team 2 wins the map
await fetch(`${baseUrl}/api/${sessionId}/updateScore`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ team: "2", changeBy: 1 })
});

// 8. Oops, undo that last score
await fetch(`${baseUrl}/api/${sessionId}/updateScore`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ team: "2", changeBy: -1 })
});

// 9. Flip sides (swap teams)
await fetch(`${baseUrl}/api/${sessionId}/flipSides`, {
  method: "POST"
});
```

---

## Response Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters, wrong game type, etc.)
- `404`: Session not found

All endpoints return plain text responses for success/error messages, except `sessionInfo` which returns JSON.

---

## Frontend Auto-Update

The frontend automatically polls for updates every 1 second, so changes made via API will appear in the dashboard and overlays within 1 second without requiring a page refresh.

