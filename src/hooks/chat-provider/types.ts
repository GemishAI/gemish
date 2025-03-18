import { type Message } from "ai";

// Define the possible model states
export type ModelState = "normal" | "search" | "think";

export interface FileUploadStatus {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

export interface Attachment {
  name: string;
  contentType: string;
  url: string;
}

export interface FileState {
  fileList: File[];
  fileUploads: FileUploadStatus[];
  attachments: Attachment[];
  isUploading: boolean;
}

export interface ChatState {
  chats: Record<string, Message[]>;
  activeChat: string | null;
  pendingMessages: Record<string, Message>;
}
