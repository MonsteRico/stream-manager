import { Request, Response } from "express";
import { env } from "../env.js";
import type { StartGGTeam } from "@stream-manager/shared";

// GET /api/startgg/teams?eventSlug=... - Get teams from start.gg event
export const getStartGGTeams = async (req: Request, res: Response) => {
  const eventSlug = req.query.eventSlug as string | undefined;

  if (!eventSlug) {
    return res.status(400).json({
      error: "eventSlug query parameter is required",
    });
  }

  if (!env.STARTGG_API_TOKEN) {
    return res.status(500).json({
      error: "STARTGG_API_TOKEN is not configured",
    });
  }

  try {
    // First, get the event ID from the slug
    const eventIdResponse = await fetch("https://api.start.gg/gql/alpha", {
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

    const eventIdData = (await eventIdResponse.json()) as any;

    if (!eventIdData.data?.event?.id) {
      return res.status(404).json({ error: "Event not found" });
    }

    const eventId = eventIdData.data.event.id;
    const teams: StartGGTeam[] = [];

    let page = 1;
    const perPage = 100;
    let hasMoreTeams = true;

    // Paginate through all teams
    while (hasMoreTeams) {
      const teamsResponse = await fetch("https://api.start.gg/gql/alpha", {
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

      const teamsData = (await teamsResponse.json()) as any;
      const fetchedTeams = teamsData.data?.event?.entrants?.nodes || [];

      if (fetchedTeams.length > 0) {
        const justTeams = fetchedTeams.map((team: any) => ({
          name: team.team?.name || "Unknown Team",
          logo:
            team.team?.images?.find((image: any) => image.type === "profile")
              ?.url || null,
        }));

        teams.push(...justTeams);
        page++;
      } else {
        hasMoreTeams = false;
      }
    }

    res.json(teams);
  } catch (error: any) {
    console.error("Error fetching start.gg teams:", error);
    res.status(500).json({
      error: `Failed to fetch teams: ${error.message}`,
    });
  }
};
