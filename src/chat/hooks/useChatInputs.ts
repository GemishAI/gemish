import { useEffect, useState, useCallback } from "react";
import Dexie from "dexie";
import { useDebouncedCallback } from "use-debounce";

// Define your database
class ChatDatabase extends Dexie {
  chatInputs: Dexie.Table<
    { id: string; userId: string; value: string },
    string
  >;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      chatInputs: "[id+userId]", // Compound primary key
    });
    this.chatInputs = this.table("chatInputs");
  }
}

const db = new ChatDatabase();

// Hook that takes userId as a parameter
function useChatInputs(userId: string) {
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Create debounced save function with userId
  const debouncedSave = useDebouncedCallback(
    async (id: string, value: string) => {
      try {
        await db.chatInputs.put({ id, userId, value });
      } catch (error) {
        console.error("Failed to save chat input:", error);
      }
    },
    500,
    { maxWait: 2000 }
  );

  // Load all chat inputs for this user
  useEffect(() => {
    async function loadChatInputs() {
      if (typeof window === "undefined") return;

      try {
        // Query only inputs for this user
        const allInputs = await db.chatInputs
          .where("userId")
          .equals(userId)
          .toArray();

        const inputsRecord: Record<string, string> = {};

        allInputs.forEach((item) => {
          inputsRecord[item.id] = item.value;
        });

        setChatInputs(inputsRecord);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load chat inputs from IndexedDB:", error);
        setIsLoaded(true);
      }
    }

    loadChatInputs();
  }, [userId]); // Re-run when userId changes

  // Get input for a specific chat
  const getInput = useCallback(
    (chatId: string | null) => {
      const id = chatId || "startChat";
      return chatInputs[id] || "";
    },
    [chatInputs]
  );

  // Set input with debounced persistence
  const setInput = useCallback(
    (chatId: string | null, value: string | ((prev: string) => string)) => {
      const id = chatId || "startChat";
      const newValue =
        typeof value === "function" ? value(chatInputs[id] || "") : value;

      // Update state immediately
      setChatInputs((prev) => ({
        ...prev,
        [id]: newValue,
      }));

      // Debounce the database write
      debouncedSave(id, newValue);
    },
    [chatInputs, debouncedSave]
  );

  // Clear a specific chat input
  const clearInput = useCallback(
    async (chatId: string) => {
      // Update state
      setChatInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[chatId];
        return newInputs;
      });

      // Remove from IndexedDB
      try {
        await db.chatInputs
          .where("[id+userId]")
          .equals([chatId, userId])
          .delete();
      } catch (error) {
        console.error("Failed to delete chat input:", error);
      }
    },
    [userId]
  );

  // Clear all inputs for this user
  const clearAllInputs = useCallback(async () => {
    // Update state
    setChatInputs({});

    // Clear only this user's inputs
    try {
      await db.chatInputs.where("userId").equals(userId).delete();
    } catch (error) {
      console.error("Failed to clear all chat inputs:", error);
    }
  }, [userId]);

  return {
    chatInputs,
    getInput,
    setInput,
    clearInput,
    clearAllInputs,
    isLoaded,
  };
}

export default useChatInputs;
