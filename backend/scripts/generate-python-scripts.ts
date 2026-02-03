#!/usr/bin/env node

/**
 * Script to generate Python scripts for maps and character bans
 * This script reads from maps.ts and characters.ts and generates
 * the corresponding Python scripts for Overwatch maps and characters
 */

import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { OverwatchMaps, OverwatchCharacters } from "@stream-manager/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert a name to snake_case for use in filenames
 * Handles special cases like "D.Va" -> "dva", "Soldier: 76" -> "soldier_76"
 */
function toSnakeCase(name: string): string {
    return name
        .toLowerCase()
        .replace(/[.:'"]/g, "") // Remove special characters
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
}

/**
 * Generate a ban script for a character
 */
function generateBanScript(characterName: string, team: "1" | "2"): string {
    return `import requests

BASE_URL = "https://stream-manager.matthewgardner.dev"
SESSION_ID = "REPLACE_ME"

response = requests.post(
    f"{BASE_URL}/api/sessions/{SESSION_ID}/updateBan",
    json={"team": "${team}", "characterName": "${characterName}"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
`;
}

/**
 * Generate a map script
 */
function generateMapScript(mapName: string): string {
    return `import requests

BASE_URL = "https://stream-manager.matthewgardner.dev"
SESSION_ID = "REPLACE_ME"

response = requests.post(
    f"{BASE_URL}/api/sessions/{SESSION_ID}/updateMap",
    json={"mapName": "${mapName}"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
`;
}

/**
 * Remove all Python files from a directory
 */
async function cleanDirectory(dirPath: string): Promise<number> {
    try {
        const files = await readdir(dirPath);
        const pythonFiles = files.filter((file) => file.endsWith(".py"));
        
        for (const file of pythonFiles) {
            await unlink(join(dirPath, file));
        }
        
        return pythonFiles.length;
    } catch (error: any) {
        // If directory doesn't exist, that's fine - we'll create it
        if (error.code === "ENOENT") {
            return 0;
        }
        throw error;
    }
}

async function generatePythonScripts() {
    // Go up from apps/backend/scripts to apps/backend
    const backendRoot = join(__dirname, "..");
    const pythonScriptsDir = join(backendRoot, "pythonScripts");
    const teamLeftBansDir = join(pythonScriptsDir, "teamLeft_bans");
    const teamRightBansDir = join(pythonScriptsDir, "teamRight_bans");
    const mapsDir = join(pythonScriptsDir, "maps");

    console.log("🔄 Generating Python scripts...");

    // Remove old files before generating new ones
    console.log("🧹 Cleaning old files...");
    const removedLeftBans = await cleanDirectory(teamLeftBansDir);
    const removedRightBans = await cleanDirectory(teamRightBansDir);
    const removedMaps = await cleanDirectory(mapsDir);
    console.log(`   Removed ${removedLeftBans + removedRightBans + removedMaps} old file(s)`);

    // Create directories if they don't exist
    await mkdir(teamLeftBansDir, { recursive: true });
    await mkdir(teamRightBansDir, { recursive: true });
    await mkdir(mapsDir, { recursive: true });

    // Generate ban scripts for Overwatch characters
    console.log("📝 Generating character ban scripts...");
    let banCount = 0;
    for (const character of OverwatchCharacters) {
        const filename = `ban_${toSnakeCase(character.name)}.py`;
        
        // Generate team left ban script
        const teamLeftScript = generateBanScript(character.name, "1");
        await writeFile(join(teamLeftBansDir, filename), teamLeftScript, "utf-8");
        
        // Generate team right ban script
        const teamRightScript = generateBanScript(character.name, "2");
        await writeFile(join(teamRightBansDir, filename), teamRightScript, "utf-8");
        
        banCount += 2;
    }
    console.log(`✅ Generated ${banCount} ban scripts (${OverwatchCharacters.length} characters × 2 teams)`);

    // Generate map scripts for Overwatch maps
    console.log("📝 Generating map scripts...");
    let mapCount = 0;
    for (const map of OverwatchMaps) {
        const filename = `set_${toSnakeCase(map.name)}.py`;
        const mapScript = generateMapScript(map.name);
        await writeFile(join(mapsDir, filename), mapScript, "utf-8");
        mapCount++;
    }
    console.log(`✅ Generated ${mapCount} map scripts`);

    console.log(`\n✨ Successfully generated ${banCount + mapCount} Python scripts!`);
}

// Run if executed directly
// Check if this module is the entry point
const isMain = import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`;
if (isMain) {
    generatePythonScripts().catch((error) => {
        console.error("Error generating Python scripts:", error);
        process.exit(1);
    });
}

export { generatePythonScripts };
