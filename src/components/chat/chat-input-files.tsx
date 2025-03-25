import Image from "next/image";
import { FileText, X } from "lucide-react";
import { Button } from "../ui/button";
import { useChat } from "@/chat/chat-provider";
import { LoaderSpinner } from "../loader-spinner";
import { FileWithMetadata } from "@/chat/hooks/useFile";
import { motion, AnimatePresence } from "motion/react";

export function ChatInputFiles() {
  const { fileUploads, fileList, removeFile, dropzone } = useChat();
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = dropzone;

  // Get upload status for a file
  const getFileUploadStatus = (file: File) => {
    return fileUploads.find((item) => item.file === file);
  };

  return (
    <div className="max-h-full overflow-x-auto pr-2">
      <div className="flex flex-row gap-2">
        <AnimatePresence initial={false}>
          {fileList.map((files, i) => {
            const { file } = files;
            const uploadStatus = getFileUploadStatus(file);
            const isUploading = uploadStatus?.status === "uploading";
            const isError = uploadStatus?.status === "error";
            const isSuccess = uploadStatus?.status === "success";

            return (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center rounded-lg border bg-background p-2 group hover:bg-muted/50 transition-colors duration-200"
              >
                {isDragActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center"
                  >
                    <p
                      className={`text-blue-600 font-medium ${
                        isDragReject ? "text-red-500" : ""
                      }`}
                    >
                      {isDragReject
                        ? "Invalid files. Only images and PDFs up to 10MB are accepted."
                        : "Drop up to 20 files (images or PDFs, max 10MB each)"}
                    </p>
                  </motion.div>
                )}

                {/* Left: Image or File Icon with potential progress overlay */}
                <div className="flex-shrink-0 mr-3 relative">
                  {file.type.startsWith("image/") ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                      {isUploading && uploadStatus && (
                        <LoaderSpinner width="20" height="20" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 relative">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      {isUploading && uploadStatus && (
                        <LoaderSpinner width="20" height="20" />
                      )}
                    </div>
                  )}

                  {/* Success indicator with animation */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error indicator with animation */}
                  <AnimatePresence>
                    {isError && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right: File Information */}
                <div className="flex-grow min-w-0 max-w-32">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name.length > 15
                      ? `${file.name.slice(0, 13)}...`
                      : file.name}
                  </p>
                  {isUploading ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-blue-500"
                    >
                      Uploading...
                    </motion.p>
                  ) : (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span className="mx-1">•</span>
                      <span>
                        {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                      </span>
                    </p>
                  )}

                  <AnimatePresence>
                    {isError && uploadStatus?.error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-500 truncate"
                        title={uploadStatus.error}
                      >
                        {uploadStatus.error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Delete Button with hover animation */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="flex-shrink-0 h-6 w-6 ml-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => removeFile(files.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
