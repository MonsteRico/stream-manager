import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "../../backend/src/routes/uploadthing";

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: "/api/uploadthing",
});
