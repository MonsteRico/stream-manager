/**
 * Get the game logo source path for a given game
 */
export function getGameLogoSrc(game: string | null): string {
  switch (game) {
    case "Overwatch":
      return "/images/gameLogos/overwatch.png";
    case "Splatoon":
      return "/images/gameLogos/splatoon.png";
    case "Rocket League":
      return "/images/gameLogos/rocket-league.png";
    case "Smash":
      return "/images/gameLogos/smash.png";
    case "Valorant":
      return "/images/gameLogos/valorant.webp";
    case "CS":
      return "/images/gameLogos/counter-strike-2.webp";
    case "League of Legends":
      return "/images/gameLogos/league-of-legends.png";
    case "Deadlock":
      return "/images/gameLogos/deadlock.png";
    case "Marvel Rivals":
      return "/images/gameLogos/rivals.jpg";
    default:
      return "/images/gameLogos/overwatch.png";
  }
}

/**
 * Extract the start.gg slug from a URL
 */
export function extractSlug(url: string): string | null {
  // Regular expression to match the slug pattern
  const slugRegex =
    /https?:\/\/(?:www\.)?start\.gg(\/tournament\/[^\/]+\/event\/[^\/]+)/;

  // Try to match the regex against the URL
  const match = url.match(slugRegex);

  // If a match is found, return the captured group (the slug)
  // Otherwise, return null
  return match ? match[1] : null;
}

/**
 * Create empty maps array with specified count
 */
export function createEmptyMaps(count: number = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: "",
    image: "",
    mode: null as null,
    winner: null as null,
    team1Ban: null as null,
    team2Ban: null as null,
  }));
}

/**
 * Default session values
 */
export const DEFAULT_SESSION_VALUES = {
  team1DisplayName: "Team 1",
  team2DisplayName: "Team 2",
  team1Color: "#8e6f3e",
  team2Color: "#555960",
  team1Score: 0,
  team2Score: 0,
  team1Abbreviation: "",
  team2Abbreviation: "",
  team1Record: "",
  team2Record: "",
  team1Rank: "",
  team2Rank: "",
  team1Ban: null,
  team2Ban: null,
  team1Logo: null,
  team2Logo: null,
} as const;
