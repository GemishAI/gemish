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
  handleSubmit: () => Promise<void>;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  reload: () => void;
  isChatLoading: boolean;
  error: Error | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  // State management
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
        router.push(`/chat/${chatId}`);
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
  const handleSubmit = useCallback(async () => {
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
      aiHandleSubmit();
    });
  }, [activeChat, input, setInput, aiHandleSubmit]);

  // Effect to trigger AI response when necessary
  useEffect(() => {
    if (activeChat && needsAiResponse.current && status === "ready") {
      const timer = setTimeout(() => {
        aiHandleSubmit();
      }, 200);

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
