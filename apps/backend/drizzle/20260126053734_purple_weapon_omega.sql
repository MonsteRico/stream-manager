CREATE TYPE "public"."game" AS ENUM('Overwatch', 'Splatoon', 'Rocket League', 'Smash', 'Valorant', 'CS', 'League of Legends', 'Deadlock', 'Marvel Rivals');--> statement-breakpoint
CREATE TABLE "stream-manager_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game" "game",
	"name" varchar(255) DEFAULT 'New Session' NOT NULL,
	"team1_display_name" varchar(255) DEFAULT 'Team 1' NOT NULL,
	"team2_display_name" varchar(255) DEFAULT 'Team 2' NOT NULL,
	"team1_score" integer DEFAULT 0 NOT NULL,
	"team2_score" integer DEFAULT 0 NOT NULL,
	"team1_color" varchar(255) DEFAULT '#8e6f3e' NOT NULL,
	"team2_color" varchar(255) DEFAULT '#555960' NOT NULL,
	"team1_logo" varchar(255),
	"team2_logo" varchar(255),
	"team1_record" varchar(255) DEFAULT '' NOT NULL,
	"team2_record" varchar(255) DEFAULT '' NOT NULL,
	"team1_abbreviation" varchar(255) DEFAULT '' NOT NULL,
	"team2_abbreviation" varchar(255) DEFAULT '' NOT NULL,
	"team1_rank" varchar(255) DEFAULT '' NOT NULL,
	"team2_rank" varchar(255) DEFAULT '' NOT NULL,
	"map_info" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"best_of" boolean DEFAULT false NOT NULL,
	"casters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"team1_first" boolean DEFAULT true NOT NULL,
	"match_name" varchar(255) DEFAULT '' NOT NULL,
	"animation_delay" integer DEFAULT 0 NOT NULL,
	"team1_ban" varchar(255),
	"team2_ban" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "stream-manager_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) DEFAULT 'New Team' NOT NULL,
	"color" varchar(255) DEFAULT '#000000' NOT NULL,
	"logo" varchar(255) DEFAULT '' NOT NULL,
	"abbreviation" varchar(255) DEFAULT '' NOT NULL,
	"rank" varchar(255) DEFAULT '' NOT NULL
);
