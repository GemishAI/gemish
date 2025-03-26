import { db } from "@/server/db";
import { chat, message } from "@/server/db/schema";
import type { Message as AIMessage } from "ai";
import { and, eq } from "drizzle-orm";

interface SaveChatParams {
  id: string;
  userId: string;
  messages: AIMessage[];
}

export async function saveChat({ id, userId, messages }: SaveChatParams) {
  if (!messages?.length) return;

  return await db.transaction(async (tx) => {
    try {
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
          title: "(New Chat)",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update the chat's updatedAt timestamp
        await tx
          .update(chat)
          .set({ updatedAt: new Date() })
          .where(eq(chat.id, id));
      }

      // Get existing messages
      const existingMessages = await tx
        .select()
        .from(message)
        .where(eq(message.chatId, id))
        .execute();

      // Create maps for faster lookups
      const existingMessageMap = new Map(
        existingMessages.map((msg) => [msg.id, msg])
      );
      const newMessageMap = new Map(messages.map((msg) => [msg.id, msg]));

      // Find messages to delete (exist in DB but not in new messages)
      const messagesToDelete = existingMessages.filter(
        (msg) => !newMessageMap.has(msg.id)
      );

      // Find messages to insert (exist in new messages but not in DB)
      const messagesToInsert = messages.filter(
        (msg) => !existingMessageMap.has(msg.id)
      );

      // Find messages to update (exist in both but might have changed)
      const messagesToUpdate = messages.filter((msg) => {
        const existing = existingMessageMap.get(msg.id);
        if (!existing) return false;
        return (
          msg.content !== existing.content ||
          JSON.stringify(msg.parts) !== JSON.stringify(existing.parts) ||
          JSON.stringify(msg.annotations) !==
            JSON.stringify(existing.annotations) ||
          JSON.stringify(msg.experimental_attachments) !==
            JSON.stringify(existing.experimental_attachments)
        );
      });

      // Perform the necessary operations
      if (messagesToDelete.length > 0) {
        await tx
          .delete(message)
          .where(
            and(eq(message.chatId, id), eq(message.id, messagesToDelete[0].id))
          );
      }

      if (messagesToInsert.length > 0) {
        await tx.insert(message).values(
          messagesToInsert.map((msg) => ({
            id: msg.id,
            chatId: id,
            role: msg.role,
            content: msg.content,
            createdAt:
              msg.createdAt instanceof Date
                ? msg.createdAt
                : new Date(msg.createdAt || Date.now()),
            updatedAt: new Date(),
            annotations: msg.annotations,
            parts: msg.parts,
            experimental_attachments: msg.experimental_attachments,
          }))
        );
      }

      if (messagesToUpdate.length > 0) {
        for (const msg of messagesToUpdate) {
          await tx
            .update(message)
            .set({
              content: msg.content,
              annotations: msg.annotations,
              parts: msg.parts,
              experimental_attachments: msg.experimental_attachments,
              updatedAt: new Date(),
            })
            .where(and(eq(message.chatId, id), eq(message.id, msg.id)));
        }
      }

      // If this is the first time we're saving messages, generate a title
      if (existingChat.length === 0 && messages.length > 0) {
        const firstUserMessage = messages.find((msg) => msg.role === "user");
        if (firstUserMessage?.content) {
          const title =
            firstUserMessage.content.substring(0, 30) +
            (firstUserMessage.content.length > 30 ? "..." : "");

          await tx.update(chat).set({ title }).where(eq(chat.id, id));
        }
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      throw error;
    }
  });
}
