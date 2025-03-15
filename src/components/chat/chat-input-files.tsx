import Image from "next/image";
import { FileText, X } from "lucide-react";
import { Button } from "../ui/button";

export function ChatInputFiles({
  fileList,
  removeFile,
}: {
  fileList: File[];
  removeFile: (file: File) => void;
}) {
  return (
    <div className="max-h-32 overflow-x-auto pr-2">
      <div className="flex flex-row gap-2">
        {fileList.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="relative flex items-center rounded-lg border bg-background p-2 group hover:bg-muted/50 transition-colors duration-200"
          >
            {/* Left: Image or File Icon */}
            <div className="flex-shrink-0 mr-3">
              {file.type.startsWith("image/") ? (
                <div className="relative w-10 h-10 rounded-md overflow-hidden">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-10 h-10">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Right: File Information */}
            <div className="flex-grow min-w-0 max-w-32">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name.length > 15
                  ? `${file.name.slice(0, 13)}...`
                  : file.name}
              </p>
              <p className="text-xs text-muted-foreground flex items-center">
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                <span className="mx-1">•</span>
                <span>{file.type.split("/")[1]?.toUpperCase() || "FILE"}</span>
              </p>
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
        ))}
      </div>
    </div>
  );
}
