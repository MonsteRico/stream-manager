import JSZip from "jszip";
import { readdir, readFile } from "fs/promises";
import { join, basename } from "path";
import { OverwatchCharacters, OverwatchMaps } from "@stream-manager/shared";
import type { CharacterInfo, MapInfo } from "@stream-manager/shared";

type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Promise<Response>;

/**
 * Recursively read all files from a directory and return them as a map
 * of relative paths to file contents
 */
async function readDirectoryRecursive(
  dirPath: string,
  basePath: string = dirPath
): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>();

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await readDirectoryRecursive(fullPath, basePath);
        for (const [subPath, content] of subFiles) {
          // Preserve directory structure in the path
          files.set(join(entry.name, subPath), content);
        }
      } else {
        const content = await readFile(fullPath);
        files.set(entry.name, content);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Replace REPLACE_ME with the actual session ID in Python script content
 */
function replaceSessionId(content: Buffer, sessionId: string): Buffer {
  const contentStr = content.toString("utf-8");
  const replaced = contentStr.replace(/REPLACE_ME/g, sessionId);
  return Buffer.from(replaced, "utf-8");
}

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
 * Extract filename from image path
 * e.g., "/characterImages/overwatch/dva.png" -> "dva.png"
 */
function getImageFilename(imagePath: string): string {
  return basename(imagePath);
}

/**
 * Generate button entry for a character ban
 */
function createCharacterBanButton(
  character: CharacterInfo,
  team: "Left" | "Right"
): any {
  const imageFilename = getImageFilename(character.image);
  const scriptFilename = `ban_${toSnakeCase(character.name)}.py`;
  const teamFolder = team === "Left" ? "teamLeft_bans" : "teamRight_bans";

  return {
    image: `**uploaded/${imageFilename}`,
    image_size: "70",
    message: `/exec type:file_path<|§|>.\\static\\files\\uploaded\\pythonScripts\\${teamFolder}\\${scriptFilename}`,
    name: character.name,
  };
}

/**
 * Generate button entry for a map
 */
function createMapButton(map: MapInfo): any {
  const imageFilename = getImageFilename(map.image);
  const scriptFilename = `set_${toSnakeCase(map.name)}.py`;

  return {
    image: `**uploaded/${imageFilename}`,
    image_size: "70",
    message: `/exec type:file_path<|§|>.\\static\\files\\uploaded\\pythonScripts\\maps\\${scriptFilename}`,
    name: map.name,
  };
}

/**
 * Generate config.json with all heroes and maps
 */
function generateConfigJson(originalConfig: any): any {
  const config = JSON.parse(JSON.stringify(originalConfig)); // Deep clone

  // Helper to fill array with VOIDs to reach target length
  const fillWithVoids = (arr: any[], targetLength: number) => {
    while (arr.length < targetLength) {
      arr.push({ VOID: "VOID" });
    }
    return arr;
  };

  // Generate character ban buttons organized by role
  // Grid is 8x4 = 32 buttons total, but we have back button + VOID, so fill to 30
  const generateRoleButtons = (
    role: "Tank" | "Damage" | "Support",
    team: "Left" | "Right"
  ) => {
    const characters = OverwatchCharacters.filter((c) => c.role === role);
    const buttons = characters.map((char) =>
      createCharacterBanButton(char, team)
    );
    return fillWithVoids(buttons, 30); // Fill to 30 buttons (32 total - 2 for back + VOID)
  };

  // Generate map buttons organized by mode
  // Grid is 8x4 = 32 buttons total, but we have back button + VOID, so fill to 30
  const generateMapModeButtons = (mode: string) => {
    const maps = OverwatchMaps.filter((m) => m.mode === mode);
    const buttons = maps.map((map) => createMapButton(map));
    return fillWithVoids(buttons, 30); // Fill to 30 buttons (32 total - 2 for back + VOID)
  };

  // Ensure front.buttons exists
  if (!config.front) config.front = {};
  if (!config.front.buttons) config.front.buttons = {};

  // Update teamLeftTank, teamLeftDamage, teamLeftSupport
  config.front.buttons.teamLeftTank = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder teamLeftBans",
      name: "Team Left Ban",
    },
    { VOID: "VOID" },
    ...generateRoleButtons("Tank", "Left"),
  ];

  config.front.buttons.teamLeftDamage = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder teamLeftBans",
      name: "Team Left Ban",
    },
    { VOID: "VOID" },
    ...generateRoleButtons("Damage", "Left"),
  ];

  config.front.buttons.teamLeftSupport = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder teamLeftBans",
      name: "Team Left Ban",
    },
    { VOID: "VOID" },
    ...generateRoleButtons("Support", "Left"),
  ];

  // Update teamRightTank, teamRightDamage, teamRightSupport
  config.front.buttons.teamRightTank = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder teamRightBans",
      name: "Team Right Ban",
    },
    { VOID: "VOID" },
    ...generateRoleButtons("Tank", "Right"),
  ];

  config.front.buttons.teamRightDamage = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder teamRightBans",
      name: "Team Right Ban",
    },
    { VOID: "VOID" },
    ...generateRoleButtons("Damage", "Right"),
  ];

  config.front.buttons.teamRightSupport = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder teamRightBans",
      name: "Team Right Ban",
    },
    { VOID: "VOID" },
    ...generateRoleButtons("Support", "Right"),
  ];

  // Update map mode folders
  config.front.buttons.mapsControl = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder maps",
      name: "back to maps",
    },
    { VOID: "VOID" },
    ...generateMapModeButtons("Control"),
  ];

  config.front.buttons.mapsHybrid = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder maps",
      name: "back to maps",
    },
    { VOID: "VOID" },
    ...generateMapModeButtons("Hybrid"),
  ];

  config.front.buttons.mapsEscort = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder maps",
      name: "back to maps",
    },
    { VOID: "VOID" },
    ...generateMapModeButtons("Escort"),
  ];

  config.front.buttons.mapsPush = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder maps",
      name: "back to maps",
    },
    { VOID: "VOID" },
    ...generateMapModeButtons("Push"),
  ];

  config.front.buttons.mapsFlashpoint = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder maps",
      name: "back to maps",
    },
    { VOID: "VOID" },
    ...generateMapModeButtons("Flashpoint"),
  ];

  config.front.buttons.mapsClash = [
    {
      image: "back10.svg",
      image_size: "110%",
      message: "/folder maps",
      name: "back to maps",
    },
    { VOID: "VOID" },
    ...generateMapModeButtons("Clash"),
  ];

  return config;
}

/**
 * Generate a zip file containing WebDeck structure with Python scripts
 * @param sessionId The session ID to replace REPLACE_ME with
 * @returns Buffer containing the zip file
 */
export async function generateWebDeckZip(sessionId: string): Promise<Buffer> {
  // Use process.cwd() to get the project root directory
  const projectRoot = process.cwd();
  const pythonScriptsDir = join(projectRoot, "pythonScripts");
  const webDeckDir = join(projectRoot, "WebDeck");
  const publicDir = join(projectRoot, "public");
  const characterImagesDir = join(publicDir, "characterImages", "overwatch");
  const mapImagesDir = join(publicDir, "mapImages", "overwatch");

  const zip = new JSZip();

  // Read all files from WebDeck directory recursively
  const webDeckFiles = await readDirectoryRecursive(webDeckDir, webDeckDir);

  // Read config.json separately so we can modify it
  let configJson: any = null;
  const configJsonPath = join(webDeckDir, "config.json");

  // Add all WebDeck files to zip, preserving directory structure
  // Skip config.json for now - we'll add the updated version later
  for (const [relativePath, content] of webDeckFiles) {
    // Normalize path separators to forward slashes for zip files
    const normalizedPath = relativePath.replace(/\\/g, "/");

    // Skip config.json - we'll process it separately
    if (normalizedPath === "config.json") {
      configJson = JSON.parse(content.toString("utf-8"));
      continue;
    }

    // Add to zip with WebDeck prefix
    const zipPath = `WebDeck/${normalizedPath}`;
    zip.file(zipPath, content);
  }

  // If config.json wasn't found, try reading it directly
  if (!configJson) {
    try {
      const configContent = await readFile(configJsonPath, "utf-8");
      configJson = JSON.parse(configContent);
    } catch (error) {
      // If config.json doesn't exist, use config_default.json
      try {
        const defaultConfigPath = join(webDeckDir, "config_default.json");
        const defaultConfigContent = await readFile(defaultConfigPath, "utf-8");
        configJson = JSON.parse(defaultConfigContent);
      } catch {
        // Create minimal config if nothing exists
        configJson = { front: { buttons: {} } };
      }
    }
  }

  // Generate updated config.json with all heroes and maps
  const updatedConfig = generateConfigJson(configJson);
  zip.file("WebDeck/config.json", JSON.stringify(updatedConfig, null, 4));

  // Copy Overwatch character images to uploaded folder
  try {
    const characterImageFiles = await readDirectoryRecursive(
      characterImagesDir,
      characterImagesDir
    );
    for (const [relativePath, content] of characterImageFiles) {
      const normalizedPath = relativePath.replace(/\\/g, "/");
      const zipPath = `WebDeck/static/files/uploaded/${normalizedPath}`;
      zip.file(zipPath, content);
    }
  } catch (error) {
    console.warn("Warning: Could not read character images directory:", error);
  }

  // Copy Overwatch map images to uploaded folder
  try {
    const mapImageFiles = await readDirectoryRecursive(
      mapImagesDir,
      mapImagesDir
    );
    for (const [relativePath, content] of mapImageFiles) {
      const normalizedPath = relativePath.replace(/\\/g, "/");
      const zipPath = `WebDeck/static/files/uploaded/${normalizedPath}`;
      zip.file(zipPath, content);
    }
  } catch (error) {
    console.warn("Warning: Could not read map images directory:", error);
  }

  // Copy Stinger.webm to WebDeck root directory
  try {
    const stingerPath = join(publicDir, "Stinger.webm");
    const stingerContent = await readFile(stingerPath);
    zip.file("WebDeck/Stinger.webm", stingerContent);
  } catch (error) {
    console.warn("Warning: Could not read Stinger.webm:", error);
  }

  // Read all Python scripts recursively
  const pythonFiles = await readDirectoryRecursive(
    pythonScriptsDir,
    pythonScriptsDir
  );

  // Add Python scripts to zip under WebDeck/static/files/uploaded/pythonScripts/
  // These will overwrite/add to the existing WebDeck structure
  for (const [relativePath, content] of pythonFiles) {
    // Replace REPLACE_ME with session ID
    const modifiedContent = replaceSessionId(content, sessionId);

    // Normalize path separators to forward slashes for zip files
    const normalizedPath = relativePath.replace(/\\/g, "/");

    // Add to zip with the correct path structure
    const zipPath = `WebDeck/static/files/uploaded/pythonScripts/${normalizedPath}`;
    zip.file(zipPath, modifiedContent);
  }

  // Generate the zip file as a buffer
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return zipBuffer;
}

// GET /api/sessions/:sessionId/download-webdeck-zip - Download WebDeck zip
export const downloadWebDeckZip: RouteHandler = async (req, params) => {
  const sessionId = params.sessionId;

  try {
    // Generate the zip file in memory
    const zipBuffer = await generateWebDeckZip(sessionId);

    // Return the zip file directly as a download
    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="WebDeck-${sessionId}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error generating WebDeck zip:", error);
    return new Response(`Error generating zip file: ${error.message}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain",
      },
    });
  }
};
