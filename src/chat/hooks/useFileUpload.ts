"use client";

import { useState, useCallback, useTransition } from "react";
import { useFile, type FileWithMetadata } from "./useFile";

export type Attachment = {
  name: string;
  contentType: string;
  url: string;
};

export type FileUploadStatus = {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
};

export function useFileUpload(fileHandlerOptions?: { autoUpload?: boolean }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [isUploading, startTransition] = useTransition();

  // Handle auto-upload when files are added
  const handleFilesAdded = useCallback(
    (newFiles: FileWithMetadata[]) => {
      if (fileHandlerOptions?.autoUpload) {
        // Create upload status objects for each file
        const newFileUploads = newFiles.map(({ id, file }) => ({
          id,
          file,
          progress: 0,
          status: "pending" as const,
        }));

        // Add new uploads to state
        setFileUploads((prev) => [...prev, ...newFileUploads]);

        // Start the upload process
        startTransition(async () => {
          await Promise.all(
            newFileUploads.map((fileUpload) =>
              uploadFileToS3(fileUpload.file, fileUpload.id)
            )
          );
        });
      }
    },
    [fileHandlerOptions?.autoUpload]
  );

  // Integrate with useFile for file selection and validation
  const { files, removeFile, clearFiles, ...fileHandlerRest } = useFile({
    onFilesAdded: handleFilesAdded,
  });

  // Upload a single file to S3
  const uploadFileToS3 = useCallback(async (file: File, id: string) => {
    try {
      setFileUploads((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "uploading" as const } : item
        )
      );

      const urlResponse = await fetch("/api/generate-presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || "Failed to generate upload URL");
      }

      const { presignedUrl, url: fileUrl } = await urlResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let lastProgress = 0;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            if (percentComplete !== lastProgress) {
              lastProgress = percentComplete;
              setFileUploads((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, progress: percentComplete } : item
                )
              );
            }
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            setFileUploads((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, status: "success" as const, url: fileUrl }
                  : item
              )
            );

            setAttachments((prev) => [
              ...prev,
              {
                name: file.name,
                contentType: file.type,
                url: fileUrl,
              },
            ]);
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error occurred during upload"));
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during upload";
      setFileUploads((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "error" as const, error: errorMessage }
            : item
        )
      );
    }
  }, []);

  // Upload all selected files to S3
  const uploadFiles = useCallback(() => {
    // Don't start upload if there are no valid files
    if (files.length === 0) return;

    // Create upload status objects for each file
    const newFileUploads = files.map(({ id, file }) => ({
      id,
      file,
      progress: 0,
      status: "pending" as const,
    }));

    // Add new uploads to state
    setFileUploads((prev) => [...prev, ...newFileUploads]);

    // Start the upload process
    startTransition(async () => {
      await Promise.all(
        newFileUploads.map((fileUpload) =>
          uploadFileToS3(fileUpload.file, fileUpload.id)
        )
      );
    });
  }, [files, uploadFileToS3]);

  // Cancel/remove a specific upload
  const cancelUpload = useCallback(
    (fileId: string) => {
      const uploadItem = fileUploads.find((item) => item.id === fileId);

      if (uploadItem) {
        // Remove from uploads state
        setFileUploads((prev) => prev.filter((item) => item.id !== fileId));

        // Also remove from attachments if already uploaded
        if (uploadItem.url) {
          setAttachments((prev) =>
            prev.filter((attachment) => attachment.url !== uploadItem.url)
          );
        }

        // Also remove from file handler's state
        removeFile(fileId);
      }
    },
    [fileUploads, removeFile]
  );

  // Clear all uploads and attachments
  const clearUploads = useCallback(() => {
    setFileUploads([]);
    setAttachments([]);
    clearFiles();
  }, [clearFiles]);

  // Get current attachments (for sending with messages)
  const getCurrentAttachments = useCallback(
    () => [...attachments],
    [attachments]
  );

  return {
    // State
    isUploading,
    fileUploads,
    attachments: getCurrentAttachments(),
    ...fileHandlerRest,

    // Actions
    uploadFiles,
    cancelUpload,
    clearUploads,
  };
}
