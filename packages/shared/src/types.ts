// Game mode types
export type OverwatchModes = "Control" | "Flashpoint" | "Escort" | "Hybrid" | "Push" | "Clash";
export type SplatoonModes = "Splatzones" | "Tower Control" | "Rainmaker" | "Clam Blitz";
export type RivalsModes = "Convoy" | "Convergence" | "Domination" | "Conquest";
export type GameModes = OverwatchModes | SplatoonModes | RivalsModes | null;

// Game types
export type GameType =
  | "Overwatch"
  | "Splatoon"
  | "Rocket League"
  | "Smash"
  | "Valorant"
  | "CS"
  | "League of Legends"
  | "Deadlock"
  | "Marvel Rivals";

// Map information
export type MapInfo = {
  id: number;
  name: string;
  image: string;
  mode: GameModes;
  winner: "team1" | "team2" | null;
  team1Ban?: string | null;
  team2Ban?: string | null;
};

// Character information
export type CharacterInfo = {
  id: number;
  name: string;
  image: string;
  role: "Tank" | "Damage" | "Support";
};

// Caster information
export type CasterInfo = {
  id: number;
  name: string;
  pronouns: string;
  twitter: string;
  twitch: string;
  youtube: string;
  instagram: string;
};

// Session types
export type Session = {
  id: string;
  game: GameType | null;
  name: string;
  team1DisplayName: string;
  team2DisplayName: string;
  team1Score: number;
  team2Score: number;
  team1Color: string;
  team2Color: string;
  team1Logo: string | null;
  team2Logo: string | null;
  team1Record: string;
  team2Record: string;
  team1Abbreviation: string;
  team2Abbreviation: string;
  team1Rank: string;
  team2Rank: string;
  mapInfo: MapInfo[];
  bestOf: boolean;
  casters: CasterInfo[];
  team1First: boolean;
  matchName: string;
  animationDelay: number;
  team1Ban: string | null;
  team2Ban: string | null;
};

export type NewSession = Partial<Omit<Session, "id">>;

// Team types
export type Team = {
  id: string;
  name: string;
  color: string;
  logo: string;
  abbreviation: string;
  rank: string;
};

export type NewTeam = Partial<Omit<Team, "id">>;

// API request/response types
export type UpdateBanRequest = {
  team: "1" | "2";
  characterName: string | null;
};

export type UpdateMapRequest = {
  mapName: string;
};

export type UpdateScoreRequest = {
  team: "1" | "2";
  changeBy: number;
};

// StartGG types
export type StartGGTeam = {
  name: string;
  logo: string | null;
};
