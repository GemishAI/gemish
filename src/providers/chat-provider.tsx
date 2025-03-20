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
  useTransition,
} from "react";
import { type Message } from "ai";
import { useChat as useAIChat } from "@ai-sdk/react";
import { generateId } from "ai";
import { type DebouncedState, useDebouncedCallback } from "use-debounce";
import { createIdGenerator } from "ai";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import {
  type FileUploadStatus,
  type ModelState,
  useFileUpload,
} from "@/hooks/chat-provider";
import { useModel } from "@/hooks/chat-provider/useModel";

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
  handleSubmit: DebouncedState<(event?: React.FormEvent) => Promise<void>>;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  reload: () => void;
  isChatLoading: boolean;
  error: Error | undefined;

  // File upload
  isUploading: boolean;
  fileUploads: FileUploadStatus[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileList: File[];
  removeFile: (file: File) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Model state
  model: ModelState;
  setModelState: (model: ModelState) => void;
  toggleSearch: () => void;
  toggleThink: () => void;
  isSearchActive: boolean;
  isThinkActive: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const router = useRouter();

  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<
    Record<string, Message>
  >({});
  const [isChatLoading, startTransition] = useTransition();

  // Ref for tracking if AI response is needed (prevents unneeded re-renders)
  const needsAiResponse = useRef(false);

  // File upload
  const {
    isUploading,
    fileInputRef,
    fileList,
    handleFileChange,
    currentAttachments,
    fileUploads,
    removeFile,
    clearAttachments,
    clearFileUploads,
  } = useFileUpload();

  // Model state
  const {
    model,
    setModelState,
    toggleSearch,
    toggleThink,
    isSearchActive,
    isThinkActive,
  } = useModel();

  // Memoize initial messages to prevent unnecessary recreations
  const initialMessages = useCallback(() => {
    if (!activeChat || !chats[activeChat]) return [];
    return chats[activeChat];
  }, [activeChat, chats]);

  const apiUrl =
    process.env.NODE_ENV === "development" ?
      "http://localhost:3000"
    : "https://gemish.vercel.app/api/ai";

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
    api: apiUrl,
    id: activeChat || undefined,
    initialMessages: initialMessages(),
    credentials: "include",
    sendExtraMessageFields: true,
    body: {
      model, // Include model in all requests
    },
    generateId: createIdGenerator({
      prefix: "msgc",
      separator: "_",
    }),
    headers: {
      "Content-Type": "application/json",
    },
    experimental_prepareRequestBody: useCallback(
      ({ messages, id }: { messages: Message[]; id: string }) => {
        // If we have a pending message for the active chat, prioritize it
        if (id && pendingMessages[id]) {
          return { message: pendingMessages[id], id, model };
        }

        // Otherwise, send the last message in the conversation
        if (messages.length > 0) {
          return { message: messages[messages.length - 1], id, model };
        }

        // Fallback for empty conversations
        return { messages, id, model };
      },
      [pendingMessages, model]
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
        router.push(`/chat/c/${chatId}`);
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/chats")
        );
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

  // Optimized submit handler with proper dependency tracking
  const handleSubmit = useDebouncedCallback(
    async (event?: React.FormEvent) => {
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
          experimental_attachments:
            currentAttachments.length > 0 ? currentAttachments : undefined,
        });
        clearAttachments();
      });

      clearFileUploads();
    },
    300,
    { leading: true, trailing: false }
  );

  // Effect to trigger AI response when necessary
  useEffect(() => {
    if (activeChat && needsAiResponse.current && status === "ready") {
      const timer = setTimeout(() => {
        aiHandleSubmit(undefined, {
          experimental_attachments:
            currentAttachments.length > 0 ? currentAttachments : undefined,
        });
        clearAttachments();
      }, 200);

      clearFileUploads();
      return () => clearTimeout(timer);
    }
  }, [activeChat, status, aiHandleSubmit]);

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
      startTransition(async () => {
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

          if (activeChat === chatId) {
            setMessages([]);
          }
        }
      });
    },
    [activeChat, chats, setMessages]
  );

  const context: ChatContextType = {
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

    // File upload
    fileInputRef,
    fileList,
    removeFile,
    handleFileChange,
    isUploading,
    fileUploads,

    // Model state
    model,
    setModelState,
    toggleSearch,
    toggleThink,
    isSearchActive,
    isThinkActive,
  };

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
