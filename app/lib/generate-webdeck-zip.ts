import JSZip from "jszip";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

/**
 * Recursively read all files from a directory and return them as a map
 * of relative paths to file contents
 */
async function readDirectoryRecursive(dirPath: string, basePath: string = dirPath): Promise<Map<string, Buffer>> {
    const files = new Map<string, Buffer>();
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
 * Generate a zip file containing WebDeck structure with Python scripts
 * @param sessionId The session ID to replace REPLACE_ME with
 * @returns Buffer containing the zip file
 */
export async function generateWebDeckZip(sessionId: string): Promise<Buffer> {
    // Use process.cwd() to get the project root directory
    // This works reliably in both development and production
    const projectRoot = process.cwd();
    const pythonScriptsDir = join(projectRoot, "pythonScripts");
    const webDeckDir = join(projectRoot, "WebDeck");

    const zip = new JSZip();

    // Read all files from WebDeck directory recursively
    const webDeckFiles = await readDirectoryRecursive(webDeckDir, webDeckDir);

    // Add all WebDeck files to zip, preserving directory structure
    for (const [relativePath, content] of webDeckFiles) {
        // Normalize path separators to forward slashes for zip files
        const normalizedPath = relativePath.replace(/\\/g, "/");
        
        // Add to zip with WebDeck prefix
        const zipPath = `WebDeck/${normalizedPath}`;
        zip.file(zipPath, content);
    }

    // Read all Python scripts recursively
    const pythonFiles = await readDirectoryRecursive(pythonScriptsDir, pythonScriptsDir);

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
