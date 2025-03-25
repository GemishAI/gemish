import { useSWRConfig } from "swr";
import { useDebouncedCallback } from "use-debounce";
import { generateId } from "ai";
import type { Message } from "ai";
import { env } from "@/env.mjs";

export function useChatCreation(
  setChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  navigateToChat: (chatId: string | null) => void,
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void
) {
  const { mutate } = useSWRConfig();

  const createChat = useDebouncedCallback(
    async (initialMessage: string, attachments = []) => {
      const chatId = generateId();
      const initialMessageObj: Message = {
        id: generateId(),
        role: "user",
        content: initialMessage,
        createdAt: new Date(),
        experimental_attachments: attachments.length > 0 ? attachments : [],
        annotations: [],
        parts: [
          {
            type: "text",
            text: initialMessage,
          },
        ],
      };

      // Optimistic update
      setChats((prev) => ({
        ...prev,
        [chatId]: [initialMessageObj],
      }));

      try {
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

        // Set as active and navigate
        navigateToChat(chatId);
        setMessages([initialMessageObj]);

        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/chats")
        );
        return chatId;
      } catch (error) {
        // Rollback optimistic update
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

  return { createChat };
}
