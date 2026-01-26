import { db } from "../db/index.js";
import { sessions, teams } from "../db/schema.js";
import { like, or } from "drizzle-orm";
import { getUploadedFiles, deleteUploadFile } from "../routes/upload.js";

// Cleanup interval: run every hour
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// File expiry: 24 hours
const FILE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Clean up expired upload files and clear stale database references
 */
async function cleanupExpiredUploads(): Promise<void> {
  console.log("[Cleanup] Starting upload cleanup...");

  try {
    const files = await getUploadedFiles();
    const now = Date.now();
    const expiredFiles: string[] = [];

    // Find expired files
    for (const file of files) {
      const age = now - file.createdAt.getTime();
      if (age > FILE_EXPIRY) {
        expiredFiles.push(file.filename);
      }
    }

    if (expiredFiles.length === 0) {
      console.log("[Cleanup] No expired files found");
      return;
    }

    console.log(`[Cleanup] Found ${expiredFiles.length} expired file(s)`);

    // Delete each expired file and clear database references
    for (const filename of expiredFiles) {
      const uploadUrl = `/uploads/${filename}`;

      // Delete the file
      const deleted = await deleteUploadFile(filename);
      if (!deleted) {
        console.error(`[Cleanup] Failed to delete file: ${filename}`);
        continue;
      }

      console.log(`[Cleanup] Deleted file: ${filename}`);

      // Clear references in teams table
      try {
        await db
          .update(teams)
          .set({ logo: "" })
          .where(like(teams.logo, `%${filename}%`));
      } catch (error) {
        console.error(`[Cleanup] Error clearing team logo references:`, error);
      }

      // Clear references in sessions table
      try {
        await db
          .update(sessions)
          .set({ team1Logo: null })
          .where(like(sessions.team1Logo, `%${filename}%`));

        await db
          .update(sessions)
          .set({ team2Logo: null })
          .where(like(sessions.team2Logo, `%${filename}%`));
      } catch (error) {
        console.error(`[Cleanup] Error clearing session logo references:`, error);
      }
    }

    console.log(`[Cleanup] Cleanup complete. Processed ${expiredFiles.length} file(s)`);
  } catch (error) {
    console.error("[Cleanup] Error during cleanup:", error);
  }
}

/**
 * Start the cleanup job
 * Runs immediately and then every hour
 */
export function startCleanupJob(): void {
  console.log("[Cleanup] Starting cleanup job (runs every hour)");

  // Run immediately on startup
  cleanupExpiredUploads();

  // Then run every hour
  setInterval(cleanupExpiredUploads, CLEANUP_INTERVAL);
}
