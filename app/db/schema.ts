import { sql } from "drizzle-orm";
import {

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

export type MapInfo = {
    id: number;
    name: string;
    image: string;
    mode: OverwatchModes | SplatoonModes | null;
    winner: "team1" | "team2" | null;
}

export type CasterInfo = {
  name: string;
  pronouns: string;
  twitter: string;
  twitch: string;
  youtube: string;
  instagram: string;
}

export const gameEnum = pgEnum('game', ["Overwatch", "Splatoon"]);

export const sessionsTable = createTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  game: gameEnum(),
  name: varchar({ length: 255 }).notNull().default("New Session"),
  team1DisplayName: varchar({ length: 255 }).notNull().default("Team 1"),
  team2DisplayName: varchar({ length: 255 }).notNull().default("Team 2"),
  team1Score: integer().notNull().default(0),
  team2Score: integer().notNull().default(0),
  team1Color: varchar({ length: 255 }).notNull().default("#0000ff"),
  team2Color: varchar({ length: 255 }).notNull().default("#ff0000"),
  team1Logo: varchar({ length: 255 }),
  team2Logo: varchar({ length: 255 }),
  mapInfo: jsonb("map_info").$type<MapInfo>().array().notNull().default(sql`'{}'::jsonb[]`),
  casters: jsonb("casters").$type<CasterInfo>().array().notNull().default(sql`'{}'::jsonb[]`),
});

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;