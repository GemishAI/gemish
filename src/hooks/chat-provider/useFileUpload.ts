"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import type { Attachment, FileUploadStatus } from "./types";

export function useFileUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileList, setFileList] = useState<File[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [isUploading, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
                item.id === id ?
                  { ...item, status: "success" as const, url: fileUrl }
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
          item.id === id ?
            { ...item, status: "error" as const, error: errorMessage }
          : item
        )
      );
    }
  }, []);

  const uploadAllFiles = useCallback(
    (files: FileUploadStatus[]) => {
      startTransition(async () => {
        await Promise.all(
          files.map((fileUpload) =>
            uploadFileToS3(fileUpload.file, fileUpload.id)
          )
        );
      });
    },
    [uploadFileToS3]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const newFiles = Array.from(files);
      const newFileUploads = newFiles.map((file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        progress: 0,
        status: "pending" as const,
      }));

      // Batch state updates together
      startTransition(() => {
        setFileList((prev) => [...prev, ...newFiles]);
        setFileUploads((prev) => [...prev, ...newFileUploads]);
      });

      // Clear input value after state updates
      if (event.target.value) event.target.value = "";

      // Start upload after state updates are complete
      uploadAllFiles(newFileUploads);
    },
    [uploadAllFiles]
  );

  const removeFile = useCallback(
    (file: File) => {
      const uploadItem = fileUploads.find((item) => item.file === file);

      // Batch state updates together
      startTransition(() => {
        setFileList((prev) => prev.filter((f) => f !== file));
        setFileUploads((prev) => prev.filter((item) => item.file !== file));
        if (uploadItem?.url) {
          setAttachments((prev) =>
            prev.filter((attachment) => attachment.url !== uploadItem.url)
          );
        }
      });
    },
    [fileUploads]
  );

  // Memoize currentAttachments to prevent unnecessary re-renders
  const currentAttachments = useCallback(() => [...attachments], [attachments]);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const clearFileUploads = useCallback(() => {
    startTransition(() => {
      setFileList([]);
      setFileUploads([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }, []);

  return {
    isUploading,
    fileInputRef,
    fileList,
    handleFileChange,
    currentAttachments: currentAttachments(),
    fileUploads,
    removeFile,
    clearAttachments,
    clearFileUploads,
  };
}
