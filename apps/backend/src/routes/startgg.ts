import { env } from "../env";
import type { StartGGTeam } from "@stream-manager/shared";

type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Promise<Response>;

// CORS headers helper
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// GET /api/startgg/teams?eventSlug=... - Get teams from start.gg event
export const getStartGGTeams: RouteHandler = async (req, params) => {
  const url = new URL(req.url);
  const eventSlug = url.searchParams.get("eventSlug");

  if (!eventSlug) {
    return Response.json(
      { error: "eventSlug query parameter is required" },
      { headers, status: 400 }
    );
  }

  if (!env.STARTGG_API_TOKEN) {
    return Response.json(
      { error: "STARTGG_API_TOKEN is not configured" },
      { headers, status: 500 }
    );
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

    const eventIdData = await eventIdResponse.json();
    
    if (!eventIdData.data?.event?.id) {
      return Response.json(
        { error: "Event not found" },
        { headers, status: 404 }
      );
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

      const teamsData = await teamsResponse.json();
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

    return Response.json(teams, { headers });
  } catch (error: any) {
    console.error("Error fetching start.gg teams:", error);
    return Response.json(
      { error: `Failed to fetch teams: ${error.message}` },
      { headers, status: 500 }
    );
  }
};
