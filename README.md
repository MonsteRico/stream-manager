# Stream Manager Redux

A monorepo with a Bun backend and Vite React frontend for managing esports stream overlays.

## Structure

```
apps/
  backend/   - Bun server with Drizzle ORM (PostgreSQL)
  frontend/  - Vite React app with TanStack Query
packages/
  shared/    - Shared types, data, and utilities
```

## Setup

```bash
# Install dependencies
bun install

# Configure environment
cd apps/backend
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL: PostgreSQL connection string
# - STARTGG_API_TOKEN: (optional) start.gg API token
# - UPLOADTHING_TOKEN: (optional) UploadThing token

# Push database schema (creates tables)
bun run db:push

# Run both apps (from root)
bun run dev:backend   # Backend at http://localhost:3000
bun run dev:frontend  # Frontend at http://localhost:5173
```

## API Endpoints

### Sessions CRUD
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get a session
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Session Actions
- `GET /api/sessions/:sessionId/sessionInfo` - Get session info
- `POST /api/sessions/:sessionId/flipSides` - Flip team sides (swap team1/team2 data)
- `POST /api/sessions/:sessionId/reset` - Reset session to defaults
- `POST /api/sessions/:sessionId/updateBan` - Update character ban (Overwatch only)
  - Body: `{ team: "1" | "2", characterName: string | null }`
- `POST /api/sessions/:sessionId/updateMap` - Update current map (Overwatch only)
  - Body: `{ mapName: string }`
- `POST /api/sessions/:sessionId/updateScore` - Update team score
  - Body: `{ team: "1" | "2", changeBy: number }`
- `GET /api/sessions/:sessionId/download-webdeck-zip` - Download WebDeck zip file

### Teams CRUD
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get a team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Start.gg Integration
- `GET /api/startgg/teams?eventSlug=...` - Get teams from a start.gg event

### File Upload (UploadThing)
- `GET /api/uploadthing` - UploadThing route handler
- `POST /api/uploadthing` - UploadThing route handler

### Health Check
- `GET /api/health` - Health check endpoint

## Shared Package

The `@stream-manager/shared` package contains:

- **Types**: `Session`, `Team`, `MapInfo`, `CasterInfo`, `CharacterInfo`, etc.
- **Game Data**: `OverwatchCharacters`, `OverwatchMaps`, `ValorantMaps`, `CSMaps`, `MarvelRivalsMaps`, etc.
- **Utilities**: `getGameLogoSrc`, `extractSlug`, `createEmptyMaps`, `DEFAULT_SESSION_VALUES`

### Usage

```typescript
// Backend
import { OverwatchCharacters, type MapInfo } from "@stream-manager/shared";

// Frontend
import { type Session, OverwatchMaps } from "@stream-manager/shared";
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `STARTGG_API_TOKEN` | No | Start.gg API token for team imports |
| `UPLOADTHING_TOKEN` | No | UploadThing token for file uploads |
