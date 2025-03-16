"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { type Message } from "ai";
import { useChat as useAIChat } from "@ai-sdk/react";
import { generateId } from "ai";
import { type DebouncedState, useDebouncedCallback } from "use-debounce";
import { createIdGenerator } from "ai";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

interface FileUploadStatus {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

interface Attachment {
  name: string;
  contentType: string;
  url: string;
}

interface ChatContextType {
  // Chat state
  chats: Record<string, Message[]>;
  activeChat: string | null;
  pendingMessages: Record<string, Message>;

  // Chat actions
  createChat: DebouncedState<(initialMessage: string) => Promise<void>>;
  setActiveChat: (chatId: string | null) => void;

  // AI chat interface (exposed from useAIChat)
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  reload: () => void;
  isChatLoading: boolean;
  error: Error | undefined;

  fileUploads: FileUploadStatus[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileList: File[];
  removeFile: (file: File) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  // State management
  const model = "normal";

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileList, setFileList] = useState<File[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<
    Record<string, Message>
  >({});
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Ref for tracking if AI response is needed (prevents unneeded re-renders)
  const needsAiResponse = useRef(false);

  // Memoize initial messages to prevent unnecessary recreations
  const initialMessages = useCallback(() => {
    if (!activeChat || !chats[activeChat]) return [];
    return chats[activeChat];
  }, [activeChat, chats]);

  // Enhanced AI chat hook with improved request preparation
  const {
    messages,
    input,
    setInput,
    handleSubmit: aiHandleSubmit,
    status,
    stop,
    reload,
    setMessages,
    error,
  } = useAIChat({
    api: "/api/ai",
    id: activeChat || undefined,
    initialMessages: initialMessages(),
    experimental_throttle: 50,
    generateId: createIdGenerator({
      prefix: "msgc",
      separator: "_",
    }),
    experimental_prepareRequestBody: useCallback(
      ({ messages, id }: { messages: Message[]; id: string }) => {
        // If we have a pending message for the active chat, prioritize it
        if (id && pendingMessages[id]) {
          return { message: pendingMessages[id], id };
        }

        // Otherwise, send the last message in the conversation
        if (messages.length > 0) {
          return { message: messages[messages.length - 1], id, model };
        }

        // Fallback for empty conversations
        return { messages, id, model };
      },
      [pendingMessages]
    ),
    onFinish: useCallback(
      (message: Message) => {
        if (!activeChat) return;

        setChats((prev) => {
          const currentMessages = prev[activeChat] || [];
          return {
            ...prev,
            [activeChat]: [...currentMessages, message],
          };
        });

        // Clear pending status
        setPendingMessages((prev) => {
          if (!prev[activeChat]) return prev;

          const newPending = { ...prev };
          delete newPending[activeChat];
          return newPending;
        });

        // Reset the trigger flag
        needsAiResponse.current = false;
      },
      [activeChat]
    ),
  });

  const clearAttachments = () => {
    setAttachments([]);
  };

  // Create a new chat with an initial message - debounced to prevent accidental double creation
  const createChat = useDebouncedCallback(
    async (initialMessage: string) => {
      const chatId = generateId();
      const initialMessageObj: Message = {
        id: generateId(),
        role: "user",
        content: initialMessage,
        createdAt: new Date(),
      };

      needsAiResponse.current = true;

      // Update local state first
      setChats((prev) => ({
        ...prev,
        [chatId]: [initialMessageObj],
      }));

      try {
        // Get all successfully uploaded file URLs
        // Create the chat on the server with the initial message
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: chatId,
            message: initialMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create chat");
        }

        // Set this as the active chat
        setActiveChat(chatId);
        setMessages([initialMessageObj]);
        router.push(`/chat/${chatId}`);
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/chats")
        );

        // Clear files and attachments after successful submission
        setFileList([]);
        setFileUploads([]);
        clearAttachments();
      } catch (error) {
        // Clean up if creation failed
        setChats((prev) => {
          const newChats = { ...prev };
          delete newChats[chatId];
          return newChats;
        });

        throw error;
      }
    },
    300,
    { leading: true, trailing: false }
  );

  const uploadFileToS3 = async (file: File, id: string) => {
    try {
      // Update status to uploading
      setFileUploads((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "uploading" as const } : item
        )
      );

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

      console.log(urlResponse, "chat provider presigned url");

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
            setFileUploads((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, progress: percentComplete } : item
              )
            );
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

            // Add to attachments array instead of fileUrls
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

        // Open connection and send the file
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
  };

  const uploadAllFiles = async (files: FileUploadStatus[]) => {
    setIsUploading(true);

    try {
      // Upload all files concurrently
      await Promise.all(
        files.map((fileUpload) =>
          uploadFileToS3(fileUpload.file, fileUpload.id)
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array and add to fileList
    const newFiles = Array.from(files);
    setFileList((prev) => [...prev, ...newFiles]);

    // Create file upload status objects
    const newFileUploads = newFiles.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setFileUploads((prev) => [...prev, ...newFileUploads]);

    // Start upload process for all new files
    uploadAllFiles(newFileUploads);

    // Reset the input
    if (event.target.value) event.target.value = "";
  };

  // Add function to remove a URL when its file is removed
  const removeFile = (file: File) => {
    // Find the upload status for this file to get its URL
    const uploadItem = fileUploads.find((item) => item.file === file);

    // Remove the file from fileList
    setFileList((prev) => prev.filter((f) => f !== file));

    // Remove the upload status
    setFileUploads((prev) => prev.filter((item) => item.file !== file));

    // Remove from attachments array if URL exists
    if (uploadItem?.url) {
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.url !== uploadItem.url)
      );
    }
  };

  // Optimized submit handler with proper dependency tracking
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      if (!activeChat || !input.trim()) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: input,
        createdAt: new Date(),
      };

      // Update state to show the message immediately
      setPendingMessages((prev) => ({
        ...prev,
        [activeChat]: userMessage,
      }));

      setChats((prev) => {
        const currentMessages = prev[activeChat] || [];
        return {
          ...prev,
          [activeChat]: [...currentMessages, userMessage],
        };
      });

      // Set flag to trigger AI response
      needsAiResponse.current = true;

      // Use a microtask instead of setTimeout for more reliable execution
      queueMicrotask(() => {
        aiHandleSubmit(event, {
          experimental_attachments: attachments,
        });
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [activeChat, input, setInput, aiHandleSubmit]
  );

  // Effect to trigger AI response when necessary
  useEffect(() => {
    if (activeChat && needsAiResponse.current && status === "ready") {
      const timer = setTimeout(() => {
        aiHandleSubmit(event, {
          experimental_attachments:
            attachments.length > 0 ? attachments : undefined,
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [activeChat, status, aiHandleSubmit, attachments]);

  // Memoized function to set active chat and load messages if needed
  const setActiveChatWithLoad = useCallback(
    (chatId: string | null) => {
      if (chatId === activeChat) return;

      // Reset state when changing chats
      setMessages([]);
      setActiveChat(chatId);
      needsAiResponse.current = false;

      if (!chatId) return;

      // Check if we already have this chat loaded
      if (chats[chatId]) {
        setMessages(chats[chatId]);

        // Check if the last message is from the user and needs a response
        const chatMessages = chats[chatId];
        if (
          chatMessages.length > 0 &&
          chatMessages[chatMessages.length - 1].role === "user"
        ) {
          needsAiResponse.current = true;
        }
        return;
      }

      // Fetch chat messages from server
      const fetchChatMessages = async () => {
        setIsChatLoading(true);
        try {
          const response = await fetch(`/api/chats/${chatId}/messages`);
          const data = await response.json();

          if (Array.isArray(data.messages)) {
            // Store the messages
            setChats((prev) => ({
              ...prev,
              [chatId]: data.messages,
            }));

            // Only update messages if this is still the active chat
            if (activeChat === chatId) {
              setMessages(data.messages);

              // Check if we need to trigger the AI
              if (
                data.messages.length > 0 &&
                data.messages[data.messages.length - 1].role === "user"
              ) {
                needsAiResponse.current = true;
              }
            }
          } else {
            console.error("Invalid message format received:", data);
            if (activeChat === chatId) {
              setMessages([]);
            }
          }
        } catch (error) {
          console.error("Failed to load chat:", error);
          setIsChatLoading(false);
          if (activeChat === chatId) {
            setMessages([]);
          }
        } finally {
          setIsChatLoading(false);
        }
      };

      fetchChatMessages();
    },
    [activeChat, chats, setMessages]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useCallback(
    () => ({
      chats,
      activeChat,
      pendingMessages,
      createChat,
      setActiveChat: setActiveChatWithLoad,
      messages,
      input,
      setInput,
      handleSubmit,
      status,
      stop,
      reload,
      isChatLoading,
      error,
      fileInputRef,
      fileList,
      removeFile,
      handleFileChange,
      isUploading,
      fileUploads,
    }),
    [
      chats,
      activeChat,
      pendingMessages,
      createChat,
      setActiveChatWithLoad,
      messages,
      input,
      setInput,
      handleSubmit,
      status,
      stop,
      reload,
      isChatLoading,
      error,
      fileInputRef,
      fileList,
      removeFile,
      handleFileChange,
      isUploading,
      fileUploads,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue()}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
