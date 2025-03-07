import { google } from "@ai-sdk/google";
import { type Message, generateId, generateText } from "ai";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { chat, message } from "./schema";

export async function loadChat(id: string) {
  try {
    const selectedChat = await db
      .select({
        id: message.id,
        role: message.role,
        createdAt: message.createdAt,
        content: message.content,
        annotations: message.annotations || undefined,
        parts: message.parts,
        experimentalAttachments: message.experimentalAttachments,
      })
      .from(message)
      .where(eq(message.chatId, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  messages,
}: {
  id: string;
  userId: string;
  messages: Message[];
}) {
  const { text: title } = await generateText({
    model: google("gemini-2.0-flash-001"),
    system:
      "You are a title generator. Create a concise, professional title summarizing the main topic of this conversation from the content. Avoid vague, abstract, or artistic phrases. The title should be clear and relevant.",
    messages: [
      { role: "user", content: messages[messages.length - 1].content },
    ],
  });

  return await db.transaction(async (tx) => {
    // Check if chat exists
    const existingChat = await tx.query.chat.findFirst({
      where: eq(chat.id, id),
    });

    // Create chat if it doesn't exist using the provided ID
    if (!existingChat) {
      await tx.insert(chat).values({
        id,
        userId,
        title: title || "New Chat",
      });
    }

    // Prepare and insert messages
    const messageRecords = messages.map((msg) => ({
      id: msg.id,
      chatId: id,
      userId,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt || new Date(),
      annotations: msg.annotations,
      parts: msg.parts,
      experimentalAttachments: msg.experimental_attachments,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    })) as any;

    // Bulk insert messages
    await tx.insert(message).values(messageRecords);

    return { id };
  });
}
