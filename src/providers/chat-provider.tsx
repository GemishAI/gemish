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
import { env } from "@/env.mjs";

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

  // Store input state for each chat separately
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});

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

  // Memoize initial messages to prevent unnecessary recreations
  const initialMessages = useCallback(() => {
    if (!activeChat || !chats[activeChat]) return [];
    return chats[activeChat];
  }, [activeChat, chats]);

  // Enhanced AI chat hook with improved request preparation
  const {
    messages,
    input: aiInput,
    setInput: setAiInput,
    handleSubmit: aiHandleSubmit,
    status,
    stop,
    reload,
    setMessages,
    error,
  } = useAIChat({
    id: activeChat || undefined,
    api: "/api/ai",
    initialMessages: initialMessages(),
    credentials: "include",
    sendExtraMessageFields: true,
    generateId: createIdGenerator({
      prefix: "msgc",
      size: 16,
    }),
    headers: {
      Authorization: `Bearer ${env.NEXT_PUBLIC_GEMISH_API_KEY}`,
    },
    experimental_prepareRequestBody: useCallback(
      ({ messages, id }: { messages: Message[]; id: string }) => {
        // If we have a pending message for the active chat, prioritize it
        if (id && pendingMessages[id]) {
          return { message: pendingMessages[id], id };
        }

        // Otherwise, send the last message in the conversation
        if (messages.length > 0) {
          return { message: messages[messages.length - 1], id };
        }

        // Fallback for empty conversations
        return { messages, id };
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

  // Get current input for the active chat or start page
  const getCurrentInput = useCallback(() => {
    if (!activeChat) {
      // For start chat page
      return chatInputs["startChat"] || "";
    }
    // For specific chat pages
    return chatInputs[activeChat] || "";
  }, [activeChat, chatInputs]);

  // Set input for the current chat or start page
  const setCurrentInput = useCallback(
    (value: string | ((prev: string) => string)) => {
      const chatId = activeChat || "startChat";

      // Handle both function and direct value updates
      const newValue =
        typeof value === "function" ? value(chatInputs[chatId] || "") : value;

      // Update our internal state
      setChatInputs((prev) => ({
        ...prev,
        [chatId]: newValue,
      }));

      // Also update AI hook's input if in a chat
      if (activeChat) {
        setAiInput(newValue);
      }
    },
    [activeChat, setAiInput, chatInputs]
  );

  // Create a new chat with an initial message - debounced to prevent accidental double creation
  const createChat = useDebouncedCallback(
    async (initialMessage: string) => {
      const chatId = generateId();
      const initialMessageObj: Message = {
        id: generateId(),
        role: "user",
        content: initialMessage,
        createdAt: new Date(),
        experimental_attachments:
          (currentAttachments.length > 0 && currentAttachments) || [],
        annotations: [],
        parts: [
          {
            type: "text",
            text: initialMessage,
          },
        ],
      };

      // Update local state first
      setChats((prev) => ({
        ...prev,
        [chatId]: [initialMessageObj],
      }));

      try {
        // Create the chat on the server with the initial message
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.NEXT_PUBLIC_GEMISH_API_KEY}`,
          },
          body: JSON.stringify({
            id: chatId,
            message: initialMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create chat");
        }

        // Clear the start chat input
        setChatInputs((prev) => ({
          ...prev,
          startChat: "",
        }));

        // Set this as the active chat
        setActiveChat(chatId);
        setMessages([initialMessageObj]);

        needsAiResponse.current = true;
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

  // Memoized function to set active chat and load messages if needed
  const setActiveChatWithLoad = useCallback(
    (chatId: string | null) => {
      if (chatId === activeChat) return;

      // Reset state when changing chats
      setMessages([]);
      setActiveChat(chatId);

      // Set the AI input to the cached value for this chat
      if (chatId && chatInputs[chatId]) {
        setAiInput(chatInputs[chatId]);
      } else {
        setAiInput("");
      }

      // Important: Don't auto-trigger messages when switching chats
      needsAiResponse.current = false;

      if (!chatId) return;

      // Check if we already have this chat loaded
      if (chats[chatId]) {
        setMessages(chats[chatId]);
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
    [activeChat, chats, setMessages, setAiInput, chatInputs]
  );

  // Optimized submit handler with proper dependency tracking
  const handleSubmit = useDebouncedCallback(
    async (event?: React.FormEvent) => {
      if (!activeChat) return;

      const currentInput = getCurrentInput();
      if (!currentInput.trim()) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: currentInput,
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

      // After submission, clear the input from our storage
      setChatInputs((prev) => ({
        ...prev,
        [activeChat]: "",
      }));

      // Also clear the AI input
      setAiInput("");

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

  const context: ChatContextType = {
    chats,
    activeChat,
    pendingMessages,
    createChat,
    setActiveChat: setActiveChatWithLoad,
    messages,
    input: getCurrentInput(),
    setInput: setCurrentInput,
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
