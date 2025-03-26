import { env } from "@/env.mjs";
import { generateId, Message } from "ai";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useSWRConfig } from "swr";

export interface UseChatOptions {
  onMessageSent?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useBasicChat(options: UseChatOptions = {}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<
    Record<string, Message>
  >({});

  const handleChatMessage = useCallback(
    async (message: string, existingChatId?: string) => {
      try {
        if (!existingChatId) {
          // Create new chat
          const response = await fetch("/api/chats", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.NEXT_PUBLIC_GEMISH_API_KEY}`,
            },
            body: JSON.stringify({ message }),
          });

          if (!response.ok) throw new Error("Failed to create chat");

          const { id: chatId } = await response.json();

          // Create message object
          const messageObj: Message = {
            id: generateId(),
            role: "user",
            content: message,
            createdAt: new Date(),
          };

          // Batch state updates
          setChats((prev) => ({
            ...prev,
            [chatId]: [messageObj],
          }));

          setPendingMessages((prev) => ({
            ...prev,
            [chatId]: messageObj,
          }));

          // Update active chat and redirect
          setActiveChat(chatId);
          router.push(`/chat/c/${chatId}`);

          // Notify of successful message send
          options.onMessageSent?.(messageObj);

          return chatId;
        } else {
          // Add message to existing chat
          const response = await fetch(
            `/api/chats/${existingChatId}/messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.NEXT_PUBLIC_GEMISH_API_KEY}`,
              },
              body: JSON.stringify({ message }),
            }
          );

          if (!response.ok) throw new Error("Failed to send message");

          const messageObj: Message = {
            id: generateId(),
            role: "user",
            content: message,
            createdAt: new Date(),
          };

          // Batch state updates
          setChats((prev) => ({
            ...prev,
            [existingChatId]: [...(prev[existingChatId] || []), messageObj],
          }));

          setPendingMessages((prev) => ({
            ...prev,
            [existingChatId]: messageObj,
          }));

          // Notify of successful message send
          options.onMessageSent?.(messageObj);

          return existingChatId;
        }
      } catch (error) {
        options.onError?.(error as Error);
        throw error;
      }
    },
    [router, options.onMessageSent, options.onError]
  );

  // Memoize the return value to prevent unnecessary rerenders
  const returnValue = useMemo(
    () => ({
      chats,
      activeChat,
      pendingMessages,
      setActiveChat,
      setPendingMessages,
      handleChatMessage,
    }),
    [
      chats,
      activeChat,
      pendingMessages,
      setActiveChat,
      setPendingMessages,
      handleChatMessage,
    ]
  );

  return returnValue;
}
