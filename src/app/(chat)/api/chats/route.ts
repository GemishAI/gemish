import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat, message } from "@/server/db/schema";
import { headers } from "next/headers";
import { eq, and, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { TITLE_GENERATOR_SYSTEM_PROMPT } from "@/config/system-prompts";
import { google } from "@ai-sdk/google";
import { generateId } from "ai";

// Quick title generator - much faster than AI
function generateQuickTitle(messageText: string): string {
  // Get the first sentence, up to 30 chars
  const firstSentence = messageText.split(/[.!?]/)[0];
  return firstSentence.length > 30
    ? `${firstSentence.substring(0, 27)}...`
    : firstSentence;
}

// Background title generation with AI
async function queueTitleGeneration(
  chatId: string,
  messageText: string,
  userId: string
) {
  setTimeout(async () => {
    try {
      const { text: title } = await generateText({
        model: google("gemini-2.0-flash-lite-preview-02-05"),
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        prompt: `Generate a title for the following conversation: ${messageText}`,
      });

      await db
        .update(chat)
        .set({ title })
        .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));

      // Revalidate to refresh UI with new title
      revalidatePath(`/chat/${chatId}`);
    } catch (error) {
      console.error("Title generation failed:", error);
    }
  }, 100); // Start right away but don't block response
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number.parseInt(searchParams.get("limit") || "20");
  const offset = Number.parseInt(searchParams.get("offset") || "0");

  const chats = await db
    .select()
    .from(chat)
    .where(eq(chat.userId, session.user.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(chat.updatedAt))
    .execute();

  return NextResponse.json({ chats });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, message: messageText } = body;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Start a transaction to ensure both chat and message are created
    await db.transaction(async (tx) => {
      // Generate a quick title from the first message
      const quickTitle = messageText
        ? generateQuickTitle(messageText)
        : "New Chat";

      // Create the chat
      await tx.insert(chat).values({
        id,
        title: quickTitle,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // If a message was provided, store it immediately
      if (messageText) {
        await tx.insert(message).values({
          id: generateId(),
          chatId: id,
          role: "user",
          parts: [],
          experimental_attachments: [],
          annotations: [],
          content: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    // Queue the AI title generation in the background if we have a message
    if (messageText) {
      queueTitleGeneration(id, messageText, session.user.id);
    }

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
