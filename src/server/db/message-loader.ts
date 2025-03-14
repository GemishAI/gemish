import { db } from "@/server/db";
import { message } from "@/server/db/schema";
import { eq, asc, and } from "drizzle-orm";
import type { Message as AIMessage } from "ai";
import { chat } from "@/server/db/schema";

/**
 * Loads all messages for a specific chat
 */
export async function loadChatMessages(chatId: string): Promise<AIMessage[]> {
  try {
    // Fetch all messages for this chat
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(asc(message.createdAt))
      .execute();

    // Transform database messages to AI SDK message format
    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system" | "data",
      content: msg.content!,
      createdAt: new Date(msg.createdAt), // Ensure it's a Date object
      experimental_attachments: msg.experimental_attachments || undefined,
    }));
  } catch (error) {
    console.error("Error loading chat messages:", error);
    return [];
  }
}

/**
 * Checks if a chat exists and belongs to a specific user
 */
export async function validateChatOwnership(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chatRecord = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
      .execute();

    return chatRecord.length > 0;
  } catch (error) {
    console.error("Error validating chat ownership:", error);
    return false;
  }
}
