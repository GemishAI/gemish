import { useCallback } from "react";
import { FileAction } from "./useFileReducer";

/**
 * Custom hook for file upload functionality
 */
export function useFileUpload(dispatch: React.Dispatch<FileAction>) {
  const uploadFileToS3 = useCallback(async (file: File, id: string) => {
    try {
      // Update status to uploading
      dispatch({ 
        type: 'UPDATE_UPLOAD_STATUS', 
        payload: { id, progress: 0, status: 'uploading' } 
      });

      // Step 1: Get presigned URL from your API
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

      // Step 2: Upload to S3 using XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress monitoring
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            dispatch({ 
              type: 'UPDATE_UPLOAD_STATUS', 
              payload: { id, progress: percentComplete, status: 'uploading' } 
            });
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            dispatch({ 
              type: 'UPDATE_UPLOAD_STATUS', 
              payload: { id, progress: 100, status: 'success', url: fileUrl } 
            });
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error occurred during upload"));
        };

        // Open connection and send the file
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during upload";
      dispatch({ 
        type: 'UPDATE_UPLOAD_STATUS', 
        payload: { id, progress: 0, status: 'error', error: errorMessage } 
      });
    }
  }, [dispatch]);

  const uploadAllFiles = useCallback(async (files: any[]) => {
    dispatch({ type: 'SET_UPLOADING', payload: true });

    try {
      // Upload all files concurrently
      await Promise.all(
        files.map((fileUpload) =>
          uploadFileToS3(fileUpload.file, fileUpload.id)
        )
      );
    } finally {
      dispatch({ type: 'SET_UPLOADING', payload: false });
    }
  }, [dispatch, uploadFileToS3]);

  return { uploadFileToS3, uploadAllFiles };
}
