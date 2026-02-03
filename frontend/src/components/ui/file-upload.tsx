import { UploadButton } from "@/lib/uploadthing";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onError,
  className,
}: FileUploadProps) {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        // UploadThing returns an array of files, get the URL from the first one
        if (res && res.length > 0 && res[0].url) {
          onUploadComplete(res[0].url);
        }
      }}
      onUploadError={(error: Error) => {
        const message = error.message || "Failed to upload file";
        onError?.(message);
        alert(message);
      }}
      className={className}
    />
  );
}
