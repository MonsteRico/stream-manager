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

// Re-export types from shared package for convenience
export type {
  MapInfo,
  CasterInfo,
  GameType,
  CharacterInfo,
} from "@stream-manager/shared";

import type { MapInfo, CasterInfo } from "@stream-manager/shared";

/**
 * Multi-project schema - prefixes all tables with "stream-manager_"
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `stream-manager_${name}`);

export const gameEnum = pgEnum("game", [
  "Overwatch",
  "Splatoon",
  "Rocket League",
  "Smash",
  "Valorant",
  "CS",
  "League of Legends",
  "Deadlock",
  "Marvel Rivals",
]);

// Sessions table
export const sessions = createTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  game: gameEnum("game"),
  name: varchar("name", { length: 255 }).notNull().default("New Session"),
  team1DisplayName: varchar("team1_display_name", { length: 255 }).notNull().default("Team 1"),
  team2DisplayName: varchar("team2_display_name", { length: 255 }).notNull().default("Team 2"),
  team1Score: integer("team1_score").notNull().default(0),
  team2Score: integer("team2_score").notNull().default(0),
  team1Color: varchar("team1_color", { length: 255 }).notNull().default("#8e6f3e"),
  team2Color: varchar("team2_color", { length: 255 }).notNull().default("#555960"),
  team1Logo: varchar("team1_logo", { length: 255 }),
  team2Logo: varchar("team2_logo", { length: 255 }),
  team1Record: varchar("team1_record", { length: 255 }).notNull().default(""),
  team2Record: varchar("team2_record", { length: 255 }).notNull().default(""),
  team1Abbreviation: varchar("team1_abbreviation", { length: 255 }).notNull().default(""),
  team2Abbreviation: varchar("team2_abbreviation", { length: 255 }).notNull().default(""),
  team1Rank: varchar("team1_rank", { length: 255 }).notNull().default(""),
  team2Rank: varchar("team2_rank", { length: 255 }).notNull().default(""),
  mapInfo: jsonb("map_info")
    .$type<MapInfo[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  bestOf: boolean("best_of").notNull().default(false),
  casters: jsonb("casters")
    .$type<CasterInfo[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  team1First: boolean("team1_first").notNull().default(true),
  matchName: varchar("match_name", { length: 255 }).notNull().default(""),
  animationDelay: integer("animation_delay").notNull().default(0),
  team1Ban: varchar("team1_ban", { length: 255 }),
  team2Ban: varchar("team2_ban", { length: 255 }),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Teams table
export const teams = createTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().default("New Team"),
  color: varchar("color", { length: 255 }).notNull().default("#000000"),
  logo: varchar("logo", { length: 255 }).notNull().default(""),
  abbreviation: varchar("abbreviation", { length: 255 }).notNull().default(""),
  rank: varchar("rank", { length: 255 }).notNull().default(""),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
