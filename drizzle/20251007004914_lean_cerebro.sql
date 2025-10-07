CREATE TYPE "public"."game" AS ENUM('Overwatch', 'Splatoon', 'Rocket League', 'Smash', 'Valorant', 'CS', 'League of Legends', 'Deadlock', 'Marvel Rivals');--> statement-breakpoint
CREATE TABLE "stream-manager_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game" "game",
	"name" varchar(255) DEFAULT 'New Session' NOT NULL,
	"team1DisplayName" varchar(255) DEFAULT 'Team 1' NOT NULL,
	"team2DisplayName" varchar(255) DEFAULT 'Team 2' NOT NULL,
	"team1Score" integer DEFAULT 0 NOT NULL,
	"team2Score" integer DEFAULT 0 NOT NULL,
	"team1Color" varchar(255) DEFAULT '#8e6f3e' NOT NULL,
	"team2Color" varchar(255) DEFAULT '#555960' NOT NULL,
	"team1Logo" varchar(255),
	"team2Logo" varchar(255),
	"team1Record" varchar(255) DEFAULT '' NOT NULL,
	"team2Record" varchar(255) DEFAULT '' NOT NULL,
	"team1Abbreviation" varchar(255) DEFAULT '' NOT NULL,
	"team2Abbreviation" varchar(255) DEFAULT '' NOT NULL,
	"team1Rank" varchar(255) DEFAULT '' NOT NULL,
	"team2Rank" varchar(255) DEFAULT '' NOT NULL,
	"map_info" jsonb[] DEFAULT ARRAY[]::jsonb[] NOT NULL,
	"bestOf" boolean DEFAULT false NOT NULL,
	"casters" jsonb[] DEFAULT ARRAY[]::jsonb[] NOT NULL,
	"team1First" boolean DEFAULT true NOT NULL,
	"matchName" varchar(255) DEFAULT '' NOT NULL,
	"animationDelay" integer DEFAULT 0 NOT NULL
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
