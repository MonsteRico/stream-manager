import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./app/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["stream-manager_*"]
} satisfies Config;
