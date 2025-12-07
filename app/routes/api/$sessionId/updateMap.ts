import { db } from '@/db';
import { sessionsTable, type MapInfo } from '@/db/schema';
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';
import { OverwatchMaps } from '@/lib/maps';

export const Route = createAPIFileRoute("/api/$sessionId/updateMap")({
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
        const mapName = body.mapName;

        // Find the map in OverwatchMaps
        const overwatchMap = OverwatchMaps.find((map) => map.name === mapName);
        if (!overwatchMap) {
            return new Response(`Map "${mapName}" not found in Overwatch maps`, { status: 400 });
        }

        const maps = session.mapInfo as MapInfo[];
        // Find the first map without a winner (the "selected" map)
        const selectedMapIndex = maps.findIndex((map) => !map.winner);
        
        if (selectedMapIndex === -1) {
            return new Response("No map available to update (all maps have winners)", { status: 400 });
        }

        // Update the selected map with the new map info
        // Also sync current session bans to this map
        maps[selectedMapIndex] = {
            ...maps[selectedMapIndex],
            name: overwatchMap.name,
            image: overwatchMap.image,
            mode: overwatchMap.mode,
            team1Ban: session.team1Ban || null,
            team2Ban: session.team2Ban || null,
        };

        await db
            .update(sessionsTable)
            .set({ mapInfo: maps })
            .where(eq(sessionsTable.id, sessionId))
            .execute();

        return new Response("Map updated successfully");
    },
});

