import { db } from '@/db';
import { sessionsTable, type MapInfo } from '@/db/schema';
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';

export const Route = createAPIFileRoute("/api/$sessionId/reset")({
    POST: async ({ request, params }) => {
        const sessionId = params.sessionId;
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, sessionId),
        });
        if (!session) {
            return new Response("Session not found", { status: 404 });
        }

        // Create 5 empty maps
        const emptyMaps: MapInfo[] = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            name: "",
            image: "",
            mode: null,
            winner: null,
            team1Ban: null,
            team2Ban: null,
        }));

        await db
            .update(sessionsTable)
            .set({
                // Reset team names
                team1DisplayName: "Team 1",
                team2DisplayName: "Team 2",
                // Reset team logos
                team1Logo: null,
                team2Logo: null,
                // Reset team colors (default colors)
                team1Color: "#8e6f3e", // RGB(142, 111, 62)
                team2Color: "#555960", // RGB(85, 89, 96)
                // Reset abbreviations, records, ranks to empty strings
                team1Abbreviation: "",
                team2Abbreviation: "",
                team1Record: "",
                team2Record: "",
                team1Rank: "",
                team2Rank: "",
                // Reset team scores to 0
                team1Score: 0,
                team2Score: 0,
                // Reset maps to 5 empty maps
                mapInfo: emptyMaps,
                // Reset bans to null
                team1Ban: null,
                team2Ban: null,
            })
            .where(eq(sessionsTable.id, sessionId))
            .execute();

        return new Response("Session reset successfully");
    },
});
