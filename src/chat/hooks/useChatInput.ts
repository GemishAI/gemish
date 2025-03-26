import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface UseChatInputOptions {
  onInputChange?: (value: string) => void;
  userId: string; // Required user ID for storage
}

export function useChatInput({ userId, onInputChange }: UseChatInputOptions) {
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});

  // Load chat inputs from IndexedDB
  const storedInputs = useLiveQuery(async () => {
    const inputs = await db.chatInputs.where("userId").equals(userId).toArray();

    return inputs.reduce<Record<string, string>>(
      (acc, input) => ({
        ...acc,
        [input.chatId]: input.content,
      }),
      {}
    );
  }, [userId]);

  // Sync state with IndexedDB
  useEffect(() => {
    if (storedInputs) {
      setChatInputs(storedInputs);
    }
  }, [storedInputs]);

  const getCurrentInput = useCallback(
    (activeChat: string | null) => {
      const chatId = activeChat || "startChat";
      return chatInputs[chatId] || "";
    },
    [chatInputs]
  );

  // Debounced database update
  const debouncedDbUpdate = useDebouncedCallback(
    async (chatId: string, content: string) => {
      try {
        await db.chatInputs.put({
          id: `${userId}-${chatId}`,
          userId,
          chatId,
          content,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to save chat input:", error);
      }
    },
    1000 // 1 second delay
  );

  const setCurrentInput = useCallback(
    (value: string | ((prev: string) => string), activeChat: string | null) => {
      const chatId = activeChat || "startChat";
      const newValue =
        typeof value === "function" ? value(chatInputs[chatId] || "") : value;

      // Update local state immediately
      setChatInputs((prev) => ({
        ...prev,
        [chatId]: newValue,
      }));

      // Notify of input change immediately
      onInputChange?.(newValue);

      // Debounce the database update
      debouncedDbUpdate(chatId, newValue);
    },
    [chatInputs, userId, onInputChange, debouncedDbUpdate]
  );

  const clearInput = useCallback(
    async (chatId: string) => {
      // Update local state immediately
      setChatInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[chatId];
        return newInputs;
      });

      // Remove from IndexedDB
      try {
        await db.chatInputs.where({ userId, chatId }).delete();
      } catch (error) {
        console.error("Failed to clear chat input:", error);
      }
    },
    [userId]
  );

  // Memoize the return value to prevent unnecessary rerenders
  const returnValue = useMemo(
    () => ({
      chatInputs,
      getCurrentInput,
      setCurrentInput,
      clearInput,
    }),
    [chatInputs, getCurrentInput, setCurrentInput, clearInput]
  );

  return returnValue;
}
