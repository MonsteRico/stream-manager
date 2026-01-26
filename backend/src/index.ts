import { db } from "./db";
import { sessions, teams } from "./db/schema";
import { env } from "./env";
import { eq } from "drizzle-orm";

// Route handlers
import {
  getSessionInfo,
  flipSides,
  resetSession,
  updateBan,
  updateMap,
  updateScore,
} from "./routes/sessions";
import { getStartGGTeams } from "./routes/startgg";
import { downloadWebDeckZip } from "./routes/webdeck";
import { handleUpload, serveUpload, ensureUploadsDir } from "./routes/upload";
import { startCleanupJob } from "./services/uploadCleanup";

// Ensure uploads directory exists on startup
ensureUploadsDir();

// Start the upload cleanup job (runs every hour, deletes files older than 24 hours)
startCleanupJob();

const server = Bun.serve({
  port: env.PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;
    const pathname = url.pathname;

    // CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Handle preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // ============================================
    // File upload routes
    // ============================================
    if (pathname === "/api/upload" && method === "POST") {
      return handleUpload(req);
    }

    // Serve uploaded files
    const uploadMatch = pathname.match(/^\/uploads\/([^\/]+)$/);
    if (uploadMatch && method === "GET") {
      const filename = uploadMatch[1];
      return serveUpload(filename);
    }

    // ============================================
    // Session-specific API routes (with sessionId param)
    // ============================================
    
    // Match pattern: /api/sessions/:sessionId/...
    const sessionActionMatch = pathname.match(/^\/api\/sessions\/([^\/]+)\/(.+)$/);
    if (sessionActionMatch) {
      const [, sessionId, action] = sessionActionMatch;
      const params = { sessionId };

      switch (action) {
        case "sessionInfo":
          if (method === "GET") return getSessionInfo(req, params);
          break;
        case "flipSides":
          if (method === "POST") return flipSides(req, params);
          break;
        case "reset":
          if (method === "POST") return resetSession(req, params);
          break;
        case "updateBan":
          if (method === "POST") return updateBan(req, params);
          break;
        case "updateMap":
          if (method === "POST") return updateMap(req, params);
          break;
        case "updateScore":
          if (method === "POST") return updateScore(req, params);
          break;
        case "download-webdeck-zip":
          if (method === "GET") return downloadWebDeckZip(req, params);
          break;
      }
    }

    // ============================================
    // Start.gg routes
    // ============================================
    if (pathname === "/api/startgg/teams" && method === "GET") {
      return getStartGGTeams(req, {});
    }

    // ============================================
    // Sessions CRUD routes
    // ============================================
    if (pathname === "/api/sessions") {
      if (method === "GET") {
        const allSessions = await db.select().from(sessions);
        return Response.json(allSessions, { headers });
      }

      if (method === "POST") {
        // Create new session with defaults
        const body = await req.json().catch(() => ({}));
        const newSession = await db.insert(sessions).values(body).returning();
        return Response.json(newSession[0], { headers, status: 201 });
      }
    }

    // Match pattern: /api/sessions/:sessionId (without action)
    const sessionMatch = pathname.match(/^\/api\/sessions\/([^\/]+)$/);
    if (sessionMatch) {
      const id = sessionMatch[1];

      if (method === "GET") {
        const session = await db
          .select()
          .from(sessions)
          .where(eq(sessions.id, id));
        if (!session.length) {
          return Response.json(
            { error: "Session not found" },
            { headers, status: 404 }
          );
        }
        return Response.json(session[0], { headers });
      }

      if (method === "DELETE") {
        await db.delete(sessions).where(eq(sessions.id, id));
        return Response.json({ success: true }, { headers });
      }

      if (method === "PUT") {
        const body = await req.json();
        const updated = await db
          .update(sessions)
          .set(body)
          .where(eq(sessions.id, id))
          .returning();
        if (!updated.length) {
          return Response.json(
            { error: "Session not found" },
            { headers, status: 404 }
          );
        }
        return Response.json(updated[0], { headers });
      }
    }

    // ============================================
    // Teams CRUD routes
    // ============================================
    if (pathname === "/api/teams") {
      if (method === "GET") {
        const allTeams = await db.select().from(teams);
        return Response.json(allTeams, { headers });
      }

      if (method === "POST") {
        const body = await req.json();
        const newTeam = await db.insert(teams).values(body).returning();
        return Response.json(newTeam[0], { headers, status: 201 });
      }
    }

    // Match pattern: /api/teams/:teamId
    const teamMatch = pathname.match(/^\/api\/teams\/([^\/]+)$/);
    if (teamMatch) {
      const id = teamMatch[1];

      if (method === "GET") {
        const team = await db.select().from(teams).where(eq(teams.id, id));
        if (!team.length) {
          return Response.json(
            { error: "Team not found" },
            { headers, status: 404 }
          );
        }
        return Response.json(team[0], { headers });
      }

      if (method === "DELETE") {
        await db.delete(teams).where(eq(teams.id, id));
        return Response.json({ success: true }, { headers });
      }

      if (method === "PUT") {
        const body = await req.json();
        const updated = await db
          .update(teams)
          .set(body)
          .where(eq(teams.id, id))
          .returning();
        if (!updated.length) {
          return Response.json(
            { error: "Team not found" },
            { headers, status: 404 }
          );
        }
        return Response.json(updated[0], { headers });
      }
    }

    // ============================================
    // Health check
    // ============================================
    if (pathname === "/api/health" && method === "GET") {
      return Response.json({ status: "ok", timestamp: new Date().toISOString() }, { headers });
    }

    return Response.json({ error: "Not found" }, { headers, status: 404 });
  },
});

console.log(`Server running at http://localhost:${env.PORT}`);
