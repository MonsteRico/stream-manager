import { db } from '@/db';
import { sessionsTable } from '@/db/schema';
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';
import { OverwatchCharacters } from '@/lib/characters';

export const Route = createAPIFileRoute("/api/$sessionId/updateBan")({
    POST: async ({ request, params }) => {
        const sessionId = params.sessionId;
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, sessionId),
        });
        if (!session) {
            return new Response("Session not found", { status: 404 });
        }

        if (session.game !== "Overwatch") {
            return new Response("This endpoint is only available for Overwatch sessions", { status: 400 });
        }

        const body = await request.json();
        const team = body.team; // Should be "1" or "2"
        const characterName = body.characterName; // Can be null to clear ban

        if (team !== "1" && team !== "2") {
            return new Response("Team must be '1' or '2'", { status: 400 });
        }

        // If characterName is provided, validate it exists
        if (characterName !== null && characterName !== undefined) {
            const character = OverwatchCharacters.find((char) => char.name === characterName);
            if (!character) {
                return new Response(`Character "${characterName}" not found in Overwatch characters`, { status: 400 });
            }
        }

        // Update the ban for the specified team in session
        const updateData: { team1Ban?: string | null; team2Ban?: string | null } = {};
        if (team === "1") {
            updateData.team1Ban = characterName || null;
        } else {
            updateData.team2Ban = characterName || null;
        }

        // Also update the ban in the current map (first map without a winner)
        const maps = session.mapInfo as MapInfo[];
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
            .update(sessionsTable)
            .set(updateData)
            .where(eq(sessionsTable.id, sessionId))
            .execute();

        return new Response("Ban updated successfully");
    },
});

