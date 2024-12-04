import { db } from '@/db';
import { sessionsTable } from '@/db/schema';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';

export const Route = createAPIFileRoute('/api/$sessionId/flipSides')({
  GET: async ({ request, params }) => {
        const sessionId = params.sessionId;
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, sessionId),
        });
        if (!session) {
            return new Response("Session not found", { status: 404 });
        }
        await db
            .update(sessionsTable)
            .set({
                team1First: !session.team1First,
            })
            .where(eq(sessionsTable.id, sessionId))
            .execute();
    return json({ message: 'Hello /api/$sessionId/flipSides' })
  },
})
