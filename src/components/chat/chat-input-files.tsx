// Updated chat-input-files.tsx
import Image from "next/image";
import { FileText, X } from "lucide-react";
import { Button } from "../ui/button";
import { useChat } from "@/providers/chat-provider";

export function ChatInputFiles() {
  const { fileUploads, fileList, removeFile } = useChat();

  // Function to render circular progress
  const CircularProgress = ({ progress }: { progress: number }) => {
    const size = 30;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const dash = (progress * circumference) / 100;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-blue-600 transition-all duration-300 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Percentage text */}
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          className="font-semibold text-xs fill-current text-blue-600"
        >
          {progress}%
        </text>
      </svg>
    );
  };

  // Get upload status for a file
  const getFileUploadStatus = (file: File) => {
    return fileUploads.find((item) => item.file === file);
  };

  return (
    <div className="max-h-32 overflow-x-auto pr-2">
      <div className="flex flex-row gap-2">
        {fileList.map((file, i) => {
          const uploadStatus = getFileUploadStatus(file);
          const isUploading = uploadStatus?.status === "uploading";
          const isError = uploadStatus?.status === "error";
          const isSuccess = uploadStatus?.status === "success";

          return (
            <div
              key={`${file.name}-${i}`}
              className="relative flex items-center rounded-lg border bg-background p-2 group hover:bg-muted/50 transition-colors duration-200"
            >
              {/* Left: Image or File Icon with potential progress overlay */}
              <div className="flex-shrink-0 mr-3 relative">
                {file.type.startsWith("image/") ?
                  <div className="relative w-10 h-10 rounded-md overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                    {isUploading && uploadStatus && (
                      <CircularProgress progress={uploadStatus.progress} />
                    )}
                  </div>
                : <div className="flex items-center justify-center w-10 h-10 relative">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    {isUploading && uploadStatus && (
                      <CircularProgress progress={uploadStatus.progress} />
                    )}
                  </div>
                }

                {/* Success indicator */}
                {isSuccess && (
                  <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Error indicator */}
                {isError && (
                  <div className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Right: File Information */}
              <div className="flex-grow min-w-0 max-w-32">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name.length > 15 ?
                    `${file.name.slice(0, 13)}...`
                  : file.name}
                </p>
                {isUploading ?
                  <p className="text-xs text-blue-500">Uploading...</p>
                : <p className="text-xs text-muted-foreground flex items-center">
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span className="mx-1">•</span>
                    <span>
                      {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                  </p>
                }

                {isError && uploadStatus?.error && (
                  <p
                    className="text-xs text-red-500 truncate"
                    title={uploadStatus.error}
                  >
                    {uploadStatus.error}
                  </p>
                )}
              </div>

              {/* Delete Button */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="flex-shrink-0 h-6 w-6 ml-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => removeFile(file)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
