import { useReducer } from "react";
import { FileState, FileUploadStatus } from "./types";

// File state reducer
export type FileAction = 
  | { type: 'ADD_FILES'; payload: File[] }
  | { type: 'UPDATE_UPLOAD_STATUS'; payload: { id: string; progress: number; status: FileUploadStatus['status']; url?: string; error?: string } }
  | { type: 'REMOVE_FILE'; payload: File }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'CLEAR_FILES' };

function fileReducer(state: FileState, action: FileAction): FileState {
  switch (action.type) {
    case 'ADD_FILES':
      const newFileUploads = action.payload.map((file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      
      return {
        ...state,
        fileList: [...state.fileList, ...action.payload],
        fileUploads: [...state.fileUploads, ...newFileUploads],
      };
    
    case 'UPDATE_UPLOAD_STATUS': {
      const { id, progress, status, url, error } = action.payload;
      const updatedUploads = state.fileUploads.map(item => 
        item.id === id ? { ...item, progress, status, ...(url && { url }), ...(error && { error }) } : item
      );
      
      // If status is success and we have a URL, add to attachments
      let updatedAttachments = [...state.attachments];
      if (status === 'success' && url) {
        const fileUpload = state.fileUploads.find(item => item.id === id);
        if (fileUpload) {
          updatedAttachments = [
            ...updatedAttachments,
            {
              name: fileUpload.file.name,
              contentType: fileUpload.file.type,
              url,
            }
          ];
        }
      }
      
      return {
        ...state,
        fileUploads: updatedUploads,
        attachments: updatedAttachments,
      };
    }
    
    case 'REMOVE_FILE': {
      const fileToRemove = action.payload;
      const uploadItem = state.fileUploads.find(item => item.file === fileToRemove);
      
      return {
        ...state,
        fileList: state.fileList.filter(f => f !== fileToRemove),
        fileUploads: state.fileUploads.filter(item => item.file !== fileToRemove),
        attachments: uploadItem?.url 
          ? state.attachments.filter(att => att.url !== uploadItem.url)
          : state.attachments,
      };
    }
    
    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.payload,
      };
      
    case 'CLEAR_FILES':
      return {
        ...state,
        fileList: [],
        fileUploads: [],
        attachments: [],
      };
      
    default:
      return state;
  }
}

const initialFileState: FileState = {
  fileList: [],
  fileUploads: [],
  attachments: [],
  isUploading: false,
};

/**
 * Hook for managing file upload state in the chat provider
 */
export function useFileReducer() {
  return useReducer(fileReducer, initialFileState);
}
