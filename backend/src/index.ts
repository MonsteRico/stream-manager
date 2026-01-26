import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { db } from "./db/index.js";
import { sessions, teams } from "./db/schema.js";
import { env } from "./env.js";
import { eq } from "drizzle-orm";

// Route handlers
import {
  getSessionInfo,
  flipSides,
  resetSession,
  updateBan,
  updateMap,
  updateScore,
} from "./routes/sessions.js";
import { getStartGGTeams } from "./routes/startgg.js";
import { downloadWebDeckZip } from "./routes/webdeck.js";
import { handleUpload, serveUpload, ensureUploadsDir } from "./routes/upload.js";
import { startCleanupJob } from "./services/uploadCleanup.js";

// Configure multer for memory storage (we'll write files ourselves)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const app = express();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Ensure uploads directory exists on startup
ensureUploadsDir();

// Start the upload cleanup job (runs every hour, deletes files older than 24 hours)
startCleanupJob();

// ============================================
// File upload routes
// ============================================
app.post("/api/upload", upload.single("file"), handleUpload);

// Serve uploaded files
app.get("/uploads/:filename", serveUpload);

// ============================================
// Session-specific API routes (with sessionId param)
// ============================================
app.get("/api/sessions/:sessionId/sessionInfo", getSessionInfo);
app.post("/api/sessions/:sessionId/flipSides", flipSides);
app.post("/api/sessions/:sessionId/reset", resetSession);
app.post("/api/sessions/:sessionId/updateBan", updateBan);
app.post("/api/sessions/:sessionId/updateMap", updateMap);
app.post("/api/sessions/:sessionId/updateScore", updateScore);
app.get("/api/sessions/:sessionId/download-webdeck-zip", downloadWebDeckZip);

// ============================================
// Start.gg routes
// ============================================
app.get("/api/startgg/teams", getStartGGTeams);

// ============================================
// Sessions CRUD routes
// ============================================
app.get("/api/sessions", async (req: Request, res: Response) => {
  const allSessions = await db.select().from(sessions);
  res.json(allSessions);
});

app.post("/api/sessions", async (req: Request, res: Response) => {
  const body = req.body || {};
  const newSession = await db.insert(sessions).values(body).returning();
  res.status(201).json(newSession[0]);
});

app.get("/api/sessions/:sessionId", async (req: Request, res: Response) => {
  const id = req.params.sessionId;
  const session = await db.select().from(sessions).where(eq(sessions.id, id));
  if (!session.length) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session[0]);
});

app.delete("/api/sessions/:sessionId", async (req: Request, res: Response) => {
  const id = req.params.sessionId;
  await db.delete(sessions).where(eq(sessions.id, id));
  res.json({ success: true });
});

app.put("/api/sessions/:sessionId", async (req: Request, res: Response) => {
  const id = req.params.sessionId;
  const body = req.body;
  const updated = await db
    .update(sessions)
    .set(body)
    .where(eq(sessions.id, id))
    .returning();
  if (!updated.length) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(updated[0]);
});

// ============================================
// Teams CRUD routes
// ============================================
app.get("/api/teams", async (req: Request, res: Response) => {
  const allTeams = await db.select().from(teams);
  res.json(allTeams);
});

app.post("/api/teams", async (req: Request, res: Response) => {
  const body = req.body;
  const newTeam = await db.insert(teams).values(body).returning();
  res.status(201).json(newTeam[0]);
});

app.get("/api/teams/:teamId", async (req: Request, res: Response) => {
  const id = req.params.teamId;
  const team = await db.select().from(teams).where(eq(teams.id, id));
  if (!team.length) {
    return res.status(404).json({ error: "Team not found" });
  }
  res.json(team[0]);
});

app.delete("/api/teams/:teamId", async (req: Request, res: Response) => {
  const id = req.params.teamId;
  await db.delete(teams).where(eq(teams.id, id));
  res.json({ success: true });
});

app.put("/api/teams/:teamId", async (req: Request, res: Response) => {
  const id = req.params.teamId;
  const body = req.body;
  const updated = await db
    .update(teams)
    .set(body)
    .where(eq(teams.id, id))
    .returning();
  if (!updated.length) {
    return res.status(404).json({ error: "Team not found" });
  }
  res.json(updated[0]);
});

// ============================================
// Health check
// ============================================
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
