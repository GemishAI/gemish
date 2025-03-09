import { google } from "@ai-sdk/google";
import { type Message, generateId, generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";
import { db } from "./index";
import { chat } from "./schema";

export async function loadChat({ id, userId }: { id: string; userId: string }) {
  console.log(`Loading chat ${id} for user ${userId}`);
  const selectedChat = await db.query.chat.findFirst({
    where: and(eq(chat.id, id), eq(chat.userId, userId)),
  });

  if (!selectedChat) {
    throw new Error(`Chat with ID ${id} not found`);
  }

  // Parse messages if they're stored as a string
  if (selectedChat.messages && typeof selectedChat.messages === "string") {
    try {
      selectedChat.messages = JSON.parse(selectedChat.messages);
    } catch (e) {
      console.error("Error parsing messages JSON:", e);
      selectedChat.messages = [];
    }
  }

  return selectedChat;
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: Message[];
  userId: string;
}) {
  try {
    console.log(`Saving chat ${id} with ${messages.length} messages`);
    // Ensure messages are properly serialized
    const serializedMessages = JSON.stringify(messages);

    await db
      .update(chat)
      .set({
        messages: serializedMessages,
        updatedAt: new Date(),
      })
      .where(and(eq(chat.userId, userId), eq(chat.id, id)));

    return { success: true };
  } catch (error) {
    console.error(`Error saving chat ${id}:`, error);
    throw error;
  }
}

export async function getChatHistory() {
  const chats = cache(
    async () => {
      return await db.query.chat.findMany();
    },
    ["chats"],
    { revalidate: 3600, tags: ["chats"] }
  );

  const data = await chats();
  return data;
}
