import { join } from "path";
import { mkdir, unlink, readdir, stat } from "fs/promises";
import { existsSync } from "fs";

// Uploads directory path
export const UPLOADS_DIR = join(process.cwd(), "uploads");

// Allowed image extensions
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

// Magic bytes for image validation
const MAGIC_BYTES: Record<string, number[][]> = {
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47]],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF....WEBP)
};

/**
 * Ensure uploads directory exists
 */
export async function ensureUploadsDir(): Promise<void> {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "")
    .replace(/\x00/g, "")
    .replace(/[\x00-\x1f\x7f]/g, ""); // Remove control characters

  // Only keep alphanumeric, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  // Ensure it doesn't start with a dot (hidden file)
  if (sanitized.startsWith(".")) {
    sanitized = "_" + sanitized.slice(1);
  }

  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split(".").pop() || "";
    sanitized = sanitized.slice(0, 90) + "." + ext;
  }

  return sanitized || "file";
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop()! : "";
}

/**
 * Validate magic bytes to ensure file is actually an image
 */
function validateMagicBytes(buffer: ArrayBuffer, extension: string): boolean {
  const bytes = new Uint8Array(buffer);
  const patterns = MAGIC_BYTES[extension];

  if (!patterns) return false;

  for (const pattern of patterns) {
    let matches = true;
    for (let i = 0; i < pattern.length; i++) {
      if (bytes[i] !== pattern[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // Additional check for WebP: bytes 8-11 should be "WEBP"
      if (extension === "webp") {
        const webpSignature = [0x57, 0x45, 0x42, 0x50]; // WEBP
        for (let i = 0; i < 4; i++) {
          if (bytes[8 + i] !== webpSignature[i]) {
            return false;
          }
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Handle file upload
 */
export async function handleUpload(
  req: Request
): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "No file provided" },
        { status: 400, headers }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400, headers }
      );
    }

    // Validate file extension
    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return Response.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400, headers }
      );
    }

    // Read file buffer for magic bytes validation
    const buffer = await file.arrayBuffer();

    // Validate magic bytes
    if (!validateMagicBytes(buffer, extension)) {
      return Response.json(
        { error: "File content does not match image type" },
        { status: 400, headers }
      );
    }

    // Generate unique filename
    const uuid = crypto.randomUUID();
    const sanitizedName = sanitizeFilename(file.name);
    const filename = `${uuid}-${sanitizedName}`;
    const filepath = join(UPLOADS_DIR, filename);

    // Write file to disk
    await Bun.write(filepath, buffer);

    // Return the URL path
    const url = `/uploads/${filename}`;

    return Response.json({ url }, { status: 201, headers });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Failed to process upload" },
      { status: 500, headers }
    );
  }
}

/**
 * Serve uploaded files
 */
export async function serveUpload(
  filename: string
): Promise<Response> {
  try {
    // Sanitize filename to prevent path traversal
    const sanitized = filename.replace(/\.\./g, "").replace(/[\/\\]/g, "");
    const filepath = join(UPLOADS_DIR, sanitized);

    // Check if file exists
    const file = Bun.file(filepath);
    const exists = await file.exists();

    if (!exists) {
      return new Response("Not found", { status: 404 });
    }

    // Get extension and MIME type
    const extension = getExtension(sanitized);
    const mimeType = MIME_TYPES[extension] || "application/octet-stream";

    // Read and return file
    const buffer = await file.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Serve upload error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * Get list of files with their creation times for cleanup
 */
export async function getUploadedFiles(): Promise<
  Array<{ filename: string; createdAt: Date }>
> {
  try {
    await ensureUploadsDir();
    const files = await readdir(UPLOADS_DIR);
    const fileInfos = await Promise.all(
      files.map(async (filename) => {
        const filepath = join(UPLOADS_DIR, filename);
        const stats = await stat(filepath);
        return {
          filename,
          createdAt: stats.birthtime,
        };
      })
    );
    return fileInfos;
  } catch (error) {
    console.error("Error reading uploads directory:", error);
    return [];
  }
}

/**
 * Delete a specific upload file
 */
export async function deleteUploadFile(filename: string): Promise<boolean> {
  try {
    const filepath = join(UPLOADS_DIR, filename);
    await unlink(filepath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    return false;
  }
}
