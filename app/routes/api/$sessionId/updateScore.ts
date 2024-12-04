import { db } from '@/db';
import { sessionsTable, type MapInfo } from '@/db/schema';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';

export const Route = createAPIFileRoute("/api/$sessionId/updateScore")({
    POST: async ({ request, params }) => {
        const sessionId = params.sessionId;
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, sessionId),
        });
        if (!session) {
            return new Response("Session not found", { status: 404 });
        }
        const body = await request.json();
        const team = body.team;
        const changeBy = parseInt(body.changeBy);

        await db
            .update(sessionsTable)
            .set({
                [`team${team}Score`]: (session[`team${team}Score` as "team1Score" | "team2Score"] as number) + changeBy,
            })
            .where(eq(sessionsTable.id, sessionId))
            .execute();

        if (changeBy > 0) {
            const maps = session.mapInfo as MapInfo[];
            // find the first map without a winner
            const lastMapIndex = maps.findIndex((map) => !map.winner);
            const lastMap = maps[lastMapIndex];
            if (lastMap) {
                lastMap.winner = `team${team}` as "team1" | "team2";
                await db.update(sessionsTable).set({ mapInfo: maps }).where(eq(sessionsTable.id, sessionId)).execute();
            }
        }
        if (changeBy < 0) {
            const maps = session.mapInfo as MapInfo[];
            // find the last map with a winner
            const lastMapIndex = maps.findLastIndex((map) => map.winner);
            const lastMap = maps[lastMapIndex];
            if (lastMap) {
                lastMap.winner = null;
                await db.update(sessionsTable).set({ mapInfo: maps }).where(eq(sessionsTable.id, sessionId)).execute();
            }
        }

        return new Response("Updated Score");
    },
});
