import type {
  Session,
  Team,
  NewSession,
  NewTeam,
  UpdateBanRequest,
  UpdateMapRequest,
  UpdateScoreRequest,
  StartGGTeam,
} from "@stream-manager/shared";

// Re-export types for convenience
export type { Session, Team, NewSession, NewTeam, StartGGTeam };
export type {
  MapInfo,
  CasterInfo,
  CharacterInfo,
  GameType,
} from "@stream-manager/shared";

const API_BASE = "/api";

// ============================================
// Sessions CRUD API
// ============================================

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function fetchSession(id: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

export async function createSession(data?: NewSession): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function updateSession(
  id: string,
  data: Partial<Session>
): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update session");
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete session");
}

// ============================================
// Session Action API Routes
// ============================================

/**
 * Get session info by ID
 */
export async function getSessionInfo(sessionId: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/sessionInfo`);
  if (!res.ok) throw new Error("Failed to get session info");
  return res.json();
}

/**
 * Flip team sides (swap all team1/team2 data)
 */
export async function flipSides(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/flipSides`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to flip sides");
}

/**
 * Reset session to default values
 */
export async function resetSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset session");
}

/**
 * Update character ban for a team (Overwatch only)
 */
export async function updateBan(
  sessionId: string,
  data: UpdateBanRequest
): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/updateBan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to update ban");
  }
}

/**
 * Update current map (Overwatch only)
 */
export async function updateMap(
  sessionId: string,
  data: UpdateMapRequest
): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/updateMap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to update map");
  }
}

/**
 * Update team score
 */
export async function updateScore(
  sessionId: string,
  data: UpdateScoreRequest
): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/updateScore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update score");
}

/**
 * Download WebDeck zip file for a session
 * Returns a Blob that can be used to trigger a download
 */
export async function downloadWebDeckZip(sessionId: string): Promise<Blob> {
  const res = await fetch(
    `${API_BASE}/sessions/${sessionId}/download-webdeck-zip`
  );
  if (!res.ok) throw new Error("Failed to download WebDeck zip");
  return res.blob();
}

/**
 * Helper to trigger download of WebDeck zip
 */
export async function triggerWebDeckDownload(sessionId: string): Promise<void> {
  const blob = await downloadWebDeckZip(sessionId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `WebDeck-${sessionId}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// Teams CRUD API
// ============================================

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export async function fetchTeam(id: string): Promise<Team> {
  const res = await fetch(`${API_BASE}/teams/${id}`);
  if (!res.ok) throw new Error("Failed to fetch team");
  return res.json();
}

export async function createTeam(data: NewTeam): Promise<Team> {
  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create team");
  return res.json();
}

export async function updateTeam(
  id: string,
  data: Partial<Team>
): Promise<Team> {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update team");
  return res.json();
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete team");
}

// ============================================
// Start.gg API
// ============================================

/**
 * Get teams from a start.gg event
 * @param eventSlug The event slug (e.g., "/tournament/my-tournament/event/main-event")
 */
export async function getStartGGTeams(
  eventSlug: string
): Promise<StartGGTeam[]> {
  const res = await fetch(
    `${API_BASE}/startgg/teams?eventSlug=${encodeURIComponent(eventSlug)}`
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to fetch start.gg teams");
  }
  return res.json();
}

// ============================================
// Health Check
// ============================================

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}
