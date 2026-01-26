import { db } from "../db";
import { sessions, type MapInfo } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  OverwatchCharacters,
  OverwatchMaps,
  createEmptyMaps,
  DEFAULT_SESSION_VALUES,
} from "@stream-manager/shared";

type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Promise<Response>;

// CORS headers helper
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// GET /api/sessions/:sessionId - Get session info
export const getSessionInfo: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session.length) {
    return Response.json(
      { error: "Session not found" },
      { headers, status: 404 }
    );
  }

  return Response.json(session[0], { headers });
};

// POST /api/sessions/:sessionId/flipSides - Flip team sides
export const flipSides: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session.length) {
    return Response.json(
      { error: "Session not found" },
      { headers, status: 404 }
    );
  }

  const currentSession = session[0];

  const tempTeam1Stuff = {
    displayName: currentSession.team1DisplayName,
    score: currentSession.team1Score,
    abbreviation: currentSession.team1Abbreviation,
    color: currentSession.team1Color,
    logo: currentSession.team1Logo,
    rank: currentSession.team1Rank,
    record: currentSession.team1Record,
    ban: currentSession.team1Ban,
  };

  // Flip bans and winners in maps - when teams swap, map winners should swap too
  const maps = currentSession.mapInfo as MapInfo[];
  const flippedMaps = maps.map((map) => ({
    id: map.id,
    name: map.name,
    image: map.image,
    mode: map.mode,
    // Flip winner: team1 becomes team2 and vice versa
    winner:
      map.winner === "team1"
        ? ("team2" as const)
        : map.winner === "team2"
          ? ("team1" as const)
          : null,
    // Flip bans: team1Ban becomes team2Ban and vice versa
    team1Ban: map.team2Ban,
    team2Ban: map.team1Ban,
  }));

  await db
    .update(sessions)
    .set({
      team1First: true,
      team1DisplayName: currentSession.team2DisplayName,
      team1Score: currentSession.team2Score,
      team1Abbreviation: currentSession.team2Abbreviation,
      team1Color: currentSession.team2Color,
      team1Logo: currentSession.team2Logo,
      team1Rank: currentSession.team2Rank,
      team1Record: currentSession.team2Record,
      team1Ban: currentSession.team2Ban,
      team2DisplayName: tempTeam1Stuff.displayName,
      team2Score: tempTeam1Stuff.score,
      team2Abbreviation: tempTeam1Stuff.abbreviation,
      team2Color: tempTeam1Stuff.color,
      team2Logo: tempTeam1Stuff.logo,
      team2Rank: tempTeam1Stuff.rank,
      team2Record: tempTeam1Stuff.record,
      team2Ban: tempTeam1Stuff.ban,
      mapInfo: flippedMaps,
    })
    .where(eq(sessions.id, sessionId));

  return Response.json({ message: "Sides flipped successfully" }, { headers });
};

// POST /api/sessions/:sessionId/reset - Reset session to defaults
export const resetSession: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session.length) {
    return Response.json(
      { error: "Session not found" },
      { headers, status: 404 }
    );
  }

  // Create 5 empty maps
  const emptyMaps = createEmptyMaps(5);

  await db
    .update(sessions)
    .set({
      ...DEFAULT_SESSION_VALUES,
      mapInfo: emptyMaps,
    })
    .where(eq(sessions.id, sessionId));

  return Response.json({ message: "Session reset successfully" }, { headers });
};

// POST /api/sessions/:sessionId/updateBan - Update character ban
export const updateBan: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session.length) {
    return Response.json(
      { error: "Session not found" },
      { headers, status: 404 }
    );
  }

  const currentSession = session[0];

  if (currentSession.game !== "Overwatch") {
    return Response.json(
      { error: "This endpoint is only available for Overwatch sessions" },
      { headers, status: 400 }
    );
  }

  const body = await req.json();
  const team = body.team; // Should be "1" or "2"
  const characterName = body.characterName; // Can be null to clear ban

  if (team !== "1" && team !== "2") {
    return Response.json(
      { error: "Team must be '1' or '2'" },
      { headers, status: 400 }
    );
  }

  // If characterName is provided, validate it exists
  if (characterName !== null && characterName !== undefined) {
    const character = OverwatchCharacters.find(
      (char) => char.name === characterName
    );
    if (!character) {
      return Response.json(
        { error: `Character "${characterName}" not found in Overwatch characters` },
        { headers, status: 400 }
      );
    }
  }

  // Update the ban for the specified team in session
  const updateData: {
    team1Ban?: string | null;
    team2Ban?: string | null;
    mapInfo?: MapInfo[];
  } = {};
  if (team === "1") {
    updateData.team1Ban = characterName || null;
  } else {
    updateData.team2Ban = characterName || null;
  }

  // Also update the ban in the current map (first map without a winner)
  const maps = currentSession.mapInfo as MapInfo[];
  const currentMapIndex = maps.findIndex((map) => !map.winner);
  if (currentMapIndex !== -1) {
    const currentMap = maps[currentMapIndex];
    if (team === "1") {
      currentMap.team1Ban = characterName || null;
    } else {
      currentMap.team2Ban = characterName || null;
    }
    updateData.mapInfo = maps;
  }

  await db
    .update(sessions)
    .set(updateData)
    .where(eq(sessions.id, sessionId));

  return Response.json({ message: "Ban updated successfully" }, { headers });
};

// POST /api/sessions/:sessionId/updateMap - Update current map
export const updateMap: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session.length) {
    return Response.json(
      { error: "Session not found" },
      { headers, status: 404 }
    );
  }

  const currentSession = session[0];

  if (currentSession.game !== "Overwatch") {
    return Response.json(
      { error: "This endpoint is only available for Overwatch sessions" },
      { headers, status: 400 }
    );
  }

  const body = await req.json();
  const mapName = body.mapName;

  // Find the map in OverwatchMaps
  const overwatchMap = OverwatchMaps.find((map) => map.name === mapName);
  if (!overwatchMap) {
    return Response.json(
      { error: `Map "${mapName}" not found in Overwatch maps` },
      { headers, status: 400 }
    );
  }

  const maps = currentSession.mapInfo as MapInfo[];
  // Find the first map without a winner (the "selected" map)
  const selectedMapIndex = maps.findIndex((map) => !map.winner);

  if (selectedMapIndex === -1) {
    return Response.json(
      { error: "No map available to update (all maps have winners)" },
      { headers, status: 400 }
    );
  }

  // Update the selected map with the new map info
  // Also sync current session bans to this map
  maps[selectedMapIndex] = {
    ...maps[selectedMapIndex],
    name: overwatchMap.name,
    image: overwatchMap.image,
    mode: overwatchMap.mode,
    team1Ban: currentSession.team1Ban || null,
    team2Ban: currentSession.team2Ban || null,
  };

  await db
    .update(sessions)
    .set({ mapInfo: maps })
    .where(eq(sessions.id, sessionId));

  return Response.json({ message: "Map updated successfully" }, { headers });
};

// POST /api/sessions/:sessionId/updateScore - Update team score
export const updateScore: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session.length) {
    return Response.json(
      { error: "Session not found" },
      { headers, status: 404 }
    );
  }

  const currentSession = session[0];
  const body = await req.json();
  const team = body.team;
  const changeBy = parseInt(body.changeBy);

  if (team !== "1" && team !== "2") {
    return Response.json(
      { error: "Team must be '1' or '2'" },
      { headers, status: 400 }
    );
  }

  const scoreField = team === "1" ? "team1Score" : "team2Score";
  const currentScore = currentSession[scoreField];

  await db
    .update(sessions)
    .set({
      [scoreField]: currentScore + changeBy,
    })
    .where(eq(sessions.id, sessionId));

  if (changeBy > 0) {
    const maps = currentSession.mapInfo as MapInfo[];
    // Find the first map without a winner
    const lastMapIndex = maps.findIndex((map) => !map.winner);
    const lastMap = maps[lastMapIndex];
    if (lastMap) {
      lastMap.winner = `team${team}` as "team1" | "team2";
      // Save current bans to this map when it gets a winner
      lastMap.team1Ban = currentSession.team1Ban || null;
      lastMap.team2Ban = currentSession.team2Ban || null;
      await db
        .update(sessions)
        .set({ mapInfo: maps })
        .where(eq(sessions.id, sessionId));
    }
    // Clear current bans after saving them to the map
    await db
      .update(sessions)
      .set({
        team1Ban: null,
        team2Ban: null,
      })
      .where(eq(sessions.id, sessionId));
  }

  if (changeBy < 0) {
    const maps = currentSession.mapInfo as MapInfo[];
    // Find the last map with a winner
    const lastMapIndex = maps.findLastIndex((map) => map.winner);
    const lastMap = maps[lastMapIndex];
    if (lastMap) {
      lastMap.winner = null;
      // Clear bans when undoing a map win
      lastMap.team1Ban = null;
      lastMap.team2Ban = null;
      await db
        .update(sessions)
        .set({ mapInfo: maps })
        .where(eq(sessions.id, sessionId));
    }
  }

  return Response.json({ message: "Score updated successfully" }, { headers });
};
