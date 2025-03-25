import {
  SetStateAction,
  Dispatch,
  useCallback,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type { Message } from "ai";

export function useChatNavigation(
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void,
  activeChat: string | null,
  setActiveChat: Dispatch<SetStateAction<string | null>>,
  chats: Record<string, Message[]>,
  setChats: Dispatch<SetStateAction<Record<string, Message[]>>>
) {
  const [isChatLoading, startTransition] = useTransition();
  const router = useRouter();

  const navigateToChat = useCallback(
    (chatId: string | null) => {
      if (chatId === activeChat) return;

      setActiveChat(chatId);

      if (!chatId) {
        setMessages([]);
        return;
      }

      if (chats[chatId]) {
        setMessages(chats[chatId]);
        return;
      }

      startTransition(async () => {
        try {
          const response = await fetch(`/api/chats/${chatId}/messages`);
          const data = await response.json();

          if (Array.isArray(data.messages)) {
            setChats((prev) => ({
              ...prev,
              [chatId]: data.messages,
            }));

            if (activeChat === chatId) {
              setMessages(data.messages);
            }
          }
        } catch (error) {
          console.error("Failed to load chat:", error);
        }
      });

      router.push(`/chat/c/${chatId}`);
    },
    [activeChat, chats, setMessages, router]
  );

  return {
    activeChat,
    chats,
    setChats,
    navigateToChat,
    isChatLoading,
  };
}
