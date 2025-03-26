"use client";

import { useCallback, useRef, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";

// Utility function for formatting file sizes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export type FileWithMetadata = {
  id: string;
  file: File;
  preview?: string;
};

export type FileError = {
  fileName: string;
  errorCode: string;
  errorMessage: string;
};

export function useFile(options?: {
  onFilesAdded?: (files: FileWithMetadata[]) => void;
  autoUpload?: boolean;
}) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Constants for file validation
  const MAX_FILES = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_FILE_TYPES = {
    "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    "application/pdf": [".pdf"],
  };

  // Process accepted files
  const handleAcceptedFiles = useCallback(
    (acceptedFiles: File[]) => {
      // Check if adding these files would exceed maximum count
      if (files.length + acceptedFiles.length > MAX_FILES) {
        toast.error(`You can only upload up to ${MAX_FILES} files at once`);
        acceptedFiles = acceptedFiles.slice(0, MAX_FILES - files.length);
      }

      if (acceptedFiles.length === 0) return;

      // Create file metadata for each accepted file
      const newFiles = acceptedFiles.map((file) => {
        const id = `file-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        // Create preview URL for images
        let preview = undefined;
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file);
        }

        return {
          id,
          file,
          preview,
        };
      });

      // Immediately call onFilesAdded callback if provided
      if (options?.onFilesAdded) {
        options.onFilesAdded(newFiles);
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    },
    [files.length, options]
  );

  // Process rejected files
  const handleRejectedFiles = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length === 0) return;

    const newErrors = fileRejections.map(({ file, errors }) => {
      const error = errors[0]; // Use the first error as the primary issue
      let errorMessage = error.message;

      // Customize error messages for better user feedback
      switch (error.code) {
        case "file-too-large":
          errorMessage = `File exceeds the maximum size of ${formatBytes(
            MAX_FILE_SIZE
          )}`;
          break;
        case "file-invalid-type":
          errorMessage = `Invalid file type. Accepted formats: images and PDFs`;
          break;
        case "too-many-files":
          errorMessage = `Too many files. Maximum allowed: ${MAX_FILES}`;
          break;
      }

      toast.error(`${file.name}: ${errorMessage}`);

      return {
        fileName: file.name,
        errorCode: error.code,
        errorMessage,
      };
    });

    setFileErrors((prevErrors) => [...prevErrors, ...newErrors]);
  }, []);

  // Configure react-dropzone with immediate upload
  const { getRootProps, getInputProps, isDragAccept, isDragReject, open } =
    useDropzone({
      onDrop: (acceptedFiles, rejectedFiles) => {
        handleAcceptedFiles(acceptedFiles);
        handleRejectedFiles(rejectedFiles);
        setIsDragActive(false);
      },
      accept: ACCEPTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      noClick: true,
      noKeyboard: true,
      onDragEnter: () => setIsDragActive(true),
      onDragLeave: () => setIsDragActive(false),
      multiple: true, // Ensure multiple file upload is enabled
    });

  // Handle file input change with immediate upload
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputFiles = event.target.files;
      if (!inputFiles || inputFiles.length === 0) return;

      const acceptedFiles: File[] = [];
      const rejectedFiles: FileRejection[] = [];

      Array.from(inputFiles).forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          rejectedFiles.push({
            file,
            errors: [{ code: "file-too-large", message: "File is too large" }],
          });
        } else {
          const isAccepted =
            file.type.startsWith("image/") || file.type === "application/pdf";

          if (isAccepted) {
            acceptedFiles.push(file);
          } else {
            rejectedFiles.push({
              file,
              errors: [
                {
                  code: "file-invalid-type",
                  message: "File type not accepted",
                },
              ],
            });
          }
        }
      });

      handleAcceptedFiles(acceptedFiles);
      handleRejectedFiles(rejectedFiles);

      // Reset input value after processing
      if (event.target.value) event.target.value = "";
    },
    [handleAcceptedFiles, handleRejectedFiles]
  );

  // Remove a file from the selection
  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prevFiles) => {
        const fileToRemove = prevFiles.find((file) => file.id === fileId);

        // Revoke object URL if it exists (important to prevent memory leaks)
        if (fileToRemove?.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }

        return prevFiles.filter((file) => file.id !== fileId);
      });

      // Also remove any associated errors
      setFileErrors((prevErrors) =>
        prevErrors.filter((error) => {
          const fileToRemove = files.find((file) => file.id === fileId);
          return fileToRemove
            ? error.fileName !== fileToRemove.file.name
            : true;
        })
      );
    },
    [files]
  );

  // Clear all files
  const clearFiles = useCallback(() => {
    // Clean up any preview URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setFiles([]);
    setFileErrors([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [files]);

  // Clean up function for component unmount
  const cleanup = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, [files]);

  return {
    // State
    files,
    fileErrors,
    isDragActive,
    fileInputRef,

    // Actions
    removeFile,
    clearFiles,
    handleFileChange,
    cleanup,

    // Dropzone props
    dropzone: {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject,
      open,
    },
  };
}
