import { db } from "@/server/db";
import { chat, message } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { Message as AIMessage } from "ai";
import { generateId } from "ai";
import { revalidateTag } from "next/cache";

interface SaveChatParams {
  id: string;
  userId: string;
  messages: AIMessage[];
}

export async function saveChat({ id, userId, messages }: SaveChatParams) {
  // Start a transaction to ensure all operations succeed or fail together
  return await db.transaction(async (tx) => {
    // Check if the chat exists
    const existingChat = await tx
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.id, id))
      .execute();

    // If chat doesn't exist, create it
    if (existingChat.length === 0) {
      await tx.insert(chat).values({
        id,
        userId,
        title: "(New Chat)", // Default title
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      revalidateTag(`chats-${userId}`);
    } else {
      // Update the chat's updatedAt timestamp
      await tx
        .update(chat)
        .set({ updatedAt: new Date() })
        .where(eq(chat.id, id));
      revalidateTag(`chat-messages-${id}`);
    }

    // Delete existing messages for this chat
    await tx.delete(message).where(eq(message.chatId, id));
    revalidateTag(`chat-messages-${id}`);

    for (const msg of messages) {
      await tx.insert(message).values({
        id: msg.id || generateId(),
        chatId: id,
        role: msg.role,
        content: msg.content,
        createdAt:
          msg.createdAt instanceof Date
            ? msg.createdAt
            : new Date(msg.createdAt || Date.now()),
        updatedAt: new Date(),
        annotations: msg.annotations || [],
        parts: msg.parts || [],
        experimental_attachments: msg.experimental_attachments || [],
      });
    }
    // If this is the first time we're saving messages, generate a title
    if (existingChat.length === 0 && messages.length > 0) {
      // Find the first user message to use for title generation
      const firstUserMessage = messages.find((msg) => msg.role === "user");

      if (firstUserMessage) {
        // Update the title based on the first message
        // This would typically call your title generation function
        // For now, we'll use a simple excerpt
        const title =
          firstUserMessage.content.substring(0, 30) +
          (firstUserMessage.content.length > 30 ? "..." : "");

        await tx.update(chat).set({ title }).where(eq(chat.id, id));
        revalidateTag(`chat-messages-${id}`);
      }
    }
  });
}
