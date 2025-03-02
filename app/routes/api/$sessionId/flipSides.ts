import { db } from '@/db';
import { sessionsTable } from '@/db/schema';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';

export const Route = createAPIFileRoute('/api/$sessionId/flipSides')({
  POST: async ({ request, params }) => {
        const sessionId = params.sessionId;
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, sessionId),
        });
        if (!session) {
            return new Response("Session not found", { status: 404 });
        }
        const tempTeam1Stuff = {
            displayName: session.team1DisplayName,
            score: session.team1Score,
            abbreviation: session.team1Abbreviation,
            color: session.team1Color,
            logo: session.team1Logo,
            rank: session.team1Rank,
            record: session.team1Record,
        };

        await db
            .update(sessionsTable)
            .set({
                team1First: true,
                team1DisplayName: session.team2DisplayName,
                team1Score: session.team2Score,
                team1Abbreviation: session.team2Abbreviation,
                team1Color: session.team2Color,
                team1Logo: session.team2Logo,
                team1Rank: session.team2Rank,
                team1Record: session.team2Record,
                team2DisplayName: tempTeam1Stuff.displayName,
                team2Score: tempTeam1Stuff.score,
                team2Abbreviation: tempTeam1Stuff.abbreviation,
                team2Color: tempTeam1Stuff.color,
                team2Logo: tempTeam1Stuff.logo,
                team2Rank: tempTeam1Stuff.rank,
                team2Record: tempTeam1Stuff.record,
            })
            .where(eq(sessionsTable.id, sessionId))
            .execute();
    return json({ message: 'Hello /api/$sessionId/flipSides' })
  },
})
