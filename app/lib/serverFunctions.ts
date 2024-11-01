import { createServerFn } from "@tanstack/start";
import { db } from "../db";
import { sessionsTable, type NewSession, type Session } from "../db/schema";
import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";
import { env } from "@/env";

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

export const getSession = createServerFn("GET", async (id: string): Promise<Session | undefined> => {
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
        casters,
        team1First,
        team1Abbreviation,
        team2Abbreviation,
        team1Record,
        team2Record,
        matchName,
        team1Rank,
        team2Rank,
        animationDelay,
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
                casters,
                team1First,
                team1Abbreviation,
                team2Abbreviation,
                team1Record,
                team2Record,
                matchName,
                team1Rank,
                team2Rank,
                animationDelay
            })
            .where(eq(sessionsTable.id, id))
            .returning();
        return session;
    },
);

export const getStartGGTeams = createServerFn("GET", async (eventSlug: string) => {
    const response = await fetch("https://api.start.gg/gql/alpha", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.STARTGG_API_TOKEN}`,
        },
        body: JSON.stringify({
            query: `
            query getEventId($slug: String) {
              event(slug: $slug) {
                id
                name
              }
            }
            `,
            variables: {
                slug: eventSlug,
            },
        }),
    });
    const data = await response.json();
    const eventId = data.data.event.id;
    console.info("Fetched event id", eventId);
    const teams = [];

    let page = 1;
    let perPage = 100;
    let hasMoreTeams = true;

    while (hasMoreTeams) {
        const response2 = await fetch("https://api.start.gg/gql/alpha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.STARTGG_API_TOKEN}`,
            },
            body: JSON.stringify({
                query: `
                    query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {
                        event(id: $eventId) {
                            id
                            name
                            entrants (query: {
                                page: $page
                                perPage: $perPage
                            }) {
                                nodes {
                                    team {
                                        name,
                                        images {
                                            type
                                            url
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
                variables: {
                    eventId,
                    page,
                    perPage,
                },
            }),
        });

        const data2 = await response2.json();
        const fetchedTeams = data2.data.event.entrants.nodes;
        const justTeams = fetchedTeams.map((team:any) => ({
            name: team.team.name,
            logo: team.team.images.find((image:any) => image.type === "profile")?.url,
        }));

        if (fetchedTeams.length > 0) {
            teams.push(...justTeams);
            page++;
        } else {
            hasMoreTeams = false;
        }
    }
    return teams;
});
