import { createUploadthing, UploadThingError } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({  file, metadata }) => {
            // This code RUNS ON YOUR SERVER after upload

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { url: file.url,  };
        }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
