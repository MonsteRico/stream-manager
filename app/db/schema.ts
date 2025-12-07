import { sql } from "drizzle-orm";
import {

  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,

  uuid,

  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `stream-manager_${name}`);

type OverwatchModes = "Control" | "Flashpoint" | "Escort" | "Hybrid" | "Push" | "Clash";
type SplatoonModes = "Splatzones" | "Tower Control" | "Rainmaker" | "Clam Blitz";
type RivalsModes = "Convoy" | "Convergence" | "Domination" | "Conquest";

export type MapInfo = {
    id: number;
    name: string;
    image: string;
    mode: OverwatchModes | SplatoonModes | RivalsModes | null;
    winner: "team1" | "team2" | null;
    team1Ban?: string | null;
    team2Ban?: string | null;
}

export type CasterInfo = {
  id: number;
  name: string;
  pronouns: string;
  twitter: string;
  twitch: string;
  youtube: string;
  instagram: string;
}

export const gameEnum = pgEnum('game', ["Overwatch", "Splatoon", "Rocket League", "Smash", "Valorant", "CS", "League of Legends", "Deadlock", "Marvel Rivals"]);

export const sessionsTable = createTable("sessions", {
    id: uuid().primaryKey().defaultRandom(),
    game: gameEnum(),
    name: varchar({ length: 255 }).notNull().default("New Session"),
    team1DisplayName: varchar({ length: 255 }).notNull().default("Team 1"),
    team2DisplayName: varchar({ length: 255 }).notNull().default("Team 2"),
    team1Score: integer().notNull().default(0),
    team2Score: integer().notNull().default(0),
    team1Color: varchar({ length: 255 }).notNull().default("#8e6f3e"),
    team2Color: varchar({ length: 255 }).notNull().default("#555960"),
    team1Logo: varchar({ length: 255 }),
    team2Logo: varchar({ length: 255 }),
    team1Record: varchar({ length: 255 }).default("").notNull(),
    team2Record: varchar({ length: 255 }).default("").notNull(),
    team1Abbreviation: varchar({ length: 255 }).default("").notNull(),
    team2Abbreviation: varchar({ length: 255 }).default("").notNull(),
    team1Rank: varchar({ length: 255 }).default("").notNull(),
    team2Rank: varchar({ length: 255 }).default("").notNull(),
    mapInfo: jsonb("map_info")
        .$type<MapInfo>()
        .array()
        .notNull()
        .default(sql`ARRAY[]::jsonb[]`),
    bestOf: boolean().notNull().default(false), // true = best of, false = play all
    casters: jsonb("casters")
        .$type<CasterInfo>()
        .array()
        .notNull()
        .default(sql`ARRAY[]::jsonb[]`),
    team1First: boolean().notNull().default(true),
    matchName: varchar({ length: 255 }).default("").notNull(),
    animationDelay: integer().notNull().default(0),
    team1Ban: varchar({ length: 255 }),
    team2Ban: varchar({ length: 255 }),
});

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;

export const teamsTable = createTable("teams", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull().default("New Team"),
    color: varchar({ length: 255 }).notNull().default("#000000"),
    logo: varchar({ length: 255 }).notNull().default(""),
    abbreviation: varchar({ length: 255 }).notNull().default(""),
    rank: varchar({length: 255}).notNull().default(""),
});

export type Team = typeof teamsTable.$inferSelect;
export type NewTeam = typeof teamsTable.$inferInsert;