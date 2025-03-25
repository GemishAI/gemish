import type { Message } from "ai";
import type { DebouncedState } from "use-debounce";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import {
  type FileUploadStatus,
  type ModelState,
  useFileUpload,
} from "@/hooks/chat-provider";
import { type FileWithMetadata } from "@/chat/hooks/useFile";

export interface ChatContextType {
  // Chat state
  chats: Record<string, Message[]>;
  activeChat: string | null;
  pendingMessages: Record<string, Message>;

  // Chat actions
  createChat: DebouncedState<
    (initialMessage: string, attachments?: any) => Promise<string>
  >;
  setActiveChat: (chatId: string | null) => void;

  // AI chat interface (exposed from useAIChat)
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: DebouncedState<
    (
      currentInput: string,
      event?: React.FormEvent,
      attachments?: any
    ) => Promise<void>
  >;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  reload: () => void;
  isChatLoading: boolean;
  error: Error | undefined;

  // File upload
  isUploading: boolean;
  fileUploads: FileUploadStatus[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileList: FileWithMetadata[];
  removeFile: (fileId: string) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dropzone: {
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
    isDragActive: boolean;
    isDragAccept: boolean;
    isDragReject: boolean;
    open: () => void;
  };
}
