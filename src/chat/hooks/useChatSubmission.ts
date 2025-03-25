import type { ChatRequestOptions, Message } from "ai";
import { useDebouncedCallback } from "use-debounce";
import { generateId } from "ai";

export function useChatSubmission(
  activeChat: string,
  setChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  setPendingMessages: React.Dispatch<
    React.SetStateAction<Record<string, Message>>
  >,
  clearInput: (chatId: string) => Promise<void>,
  aiHandleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void
) {
  const handleSubmit = useDebouncedCallback(
    async (currentInput: string, event?: React.FormEvent, attachments = []) => {
      if (!activeChat || !currentInput.trim()) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: currentInput,
        createdAt: new Date(),
        experimental_attachments: attachments.length > 0 ? attachments : [],
      };

      // Update pending state and chat history
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

      // Clear input
      clearInput(activeChat);

      // Trigger AI response in the next tick
      queueMicrotask(() => {
        aiHandleSubmit(event, {
          experimental_attachments: attachments,
        });
      });
    },
    300,
    { leading: true, trailing: false }
  );

  return { handleSubmit };
}
