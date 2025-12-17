import { createAPIFileRoute } from "@tanstack/start/api";
import { generateWebDeckZip } from "@/lib/generate-webdeck-zip";

export const Route = createAPIFileRoute("/api/$sessionId/download-webdeck-zip")({
    GET: async ({ params }) => {
        const sessionId = params.sessionId;

        try {
            // Generate the zip file in memory
            const zipBuffer = await generateWebDeckZip(sessionId);

            // Return the zip file directly as a download
            // No need to write to disk - Bun handles the buffer efficiently
            return new Response(zipBuffer, {
                headers: {
                    "Content-Type": "application/zip",
                    "Content-Disposition": `attachment; filename="WebDeck-${sessionId}.zip"`,
                    "Content-Length": zipBuffer.length.toString(),
                },
            });
        } catch (error: any) {
            console.error("Error generating WebDeck zip:", error);
            return new Response(`Error generating zip file: ${error.message}`, {
                status: 500,
            });
        }
    },
});
