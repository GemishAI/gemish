"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import { type Message } from "ai";
import { useChat as useAIChat } from "@ai-sdk/react";
import { createIdGenerator } from "ai";
import { useFileUpload } from "@/chat/hooks/useFileUpload";
import type { ChatContextType } from "./types/chat-types";
import { useFile } from "./hooks/useFile";
import { useChatCreation } from "./hooks/useChatCreation";
import { useChatSubmission } from "./hooks/useChatSubmission";
import useChatInputs from "./hooks/useChatInputs";
import { useChatNavigation } from "./hooks/useChatNavigation";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<
    Record<string, Message>
  >({});

  // Ref for tracking if AI response is needed (prevents unneeded re-renders)
  const needsAiResponse = useRef(false);

  // File upload hooks
  const {
    removeFile,
    dropzone,
    handleFileChange,
    files: fileList,
    fileInputRef,
  } = useFile();

  const { isUploading, attachments, fileUploads, clearUploads } =
    useFileUpload();

  const {
    chatInputs,
    getInput,
    setInput: setPersistentInput,
    clearInput,
    isLoaded,
  } = useChatInputs("11");

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

  const { isChatLoading, navigateToChat } = useChatNavigation(
    setMessages,
    activeChat,
    setActiveChat,
    chats,
    setChats
  );

  const { handleSubmit } = useChatSubmission(
    activeChat!,
    setChats,
    setPendingMessages,
    clearInput,
    aiHandleSubmit
  );

  const { createChat } = useChatCreation(setChats, navigateToChat, setMessages);

  // Get current input for the active chat
  const getCurrentInput = useCallback(() => {
    return getInput(activeChat);
  }, [activeChat, getInput]);

  // Set input for the current chat
  const setCurrentInput = useCallback(
    (value: string | ((prev: string) => string)) => {
      // Update persistent storage
      setPersistentInput(activeChat, value);

      // Also update AI hook's input if in a chat
      if (activeChat) {
        const resolvedValue =
          typeof value === "function" ? value(getInput(activeChat)) : value;
        setAiInput(resolvedValue);
      }
    },
    [activeChat, setPersistentInput, setAiInput, getInput]
  );

  const context: ChatContextType = {
    chats,
    activeChat,
    pendingMessages,
    setActiveChat,
    messages,
    createChat,

    // chat input
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
    dropzone,
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
