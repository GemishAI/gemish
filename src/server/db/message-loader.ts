import { db } from "@/server/db";
import { chat, message } from "@/server/db/schema";
import type { Message as AIMessage } from "ai";
import { and, asc, eq } from "drizzle-orm";

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
    return messages.map(({ chatId, updatedAt, ...rest }) => ({
      ...rest,
      role: rest.role as "user" | "assistant" | "system" | "data",
      content: rest.content!,
      experimental_attachments: rest.experimental_attachments || undefined,
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
