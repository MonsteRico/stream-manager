import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  // Define image uploader route
  imageUploader: f({
    image: {
      /**
       * Max file size: 5MB (matching previous implementation)
       * Max file count: 1
       * Allowed types: jpg, jpeg, png, gif, webp (handled by image type)
       */
      maxFileSize: "5MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("Upload completed", data);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
