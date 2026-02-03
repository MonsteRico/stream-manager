// Environment variables with validation
function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  NODE_ENV: getEnv("NODE_ENV", false) || "development",
  PORT: parseInt(getEnv("PORT", false) || "3000", 10),
  STARTGG_API_TOKEN: getEnv("STARTGG_API_TOKEN", false),
  UPLOADTHING_TOKEN: getEnv("UPLOADTHING_TOKEN"),
};
