import { createServerFn } from "@tanstack/start";
import { db } from "../db";
import { sessionsTable, type NewSession, type Session } from "../db/schema";
import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";

export const startSession = createServerFn("POST", async () => {
    const [newSession] = await db.insert(sessionsTable).values({}).returning();
    if (!newSession) {
        throw new Error("Failed to create new session");
    }
    return newSession;
});

export const endSession = createServerFn("POST", async (id: string) => {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
});

export const getSession = createServerFn("GET", async (id: string) : Promise<Session | undefined> => {
    console.info("Fetching session with id", id);
    return await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, id),
    });
});

export const sessionQueryOptions = (id: string) =>
    queryOptions({
        queryKey: ["session"],
        queryFn: () => getSession(id),
    });

export const updateSession = createServerFn(
    "POST",
    async ({
        id,
        name,
        game,
        team1DisplayName,
        team2DisplayName,
        team1Color,
        team2Color,
        team1Logo,
        team2Logo,
        team1Score,
        team2Score,
        mapInfo,
        casters
    }: NewSession & { id: string }) => {
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, id),
        });
        if (!session) {
            throw new Error("Session not found");
        }

        if (game !== session.game && game) {
          // Game changed, reset mapInfo
          mapInfo = [];
        }

        await db
            .update(sessionsTable)
            .set({
                name,
                game,
                team1DisplayName,
                team2DisplayName,
                team1Color,
                team2Color,
                team1Logo,
                team2Logo,
                team1Score,
                team2Score,
                mapInfo,
                casters
            })
            .where(eq(sessionsTable.id, id))
            .returning();
        return session;
    },
);
