import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat, message } from "@/server/db/schema";
import { headers } from "next/headers";
import { eq, and, desc, asc, ilike, count } from "drizzle-orm";
import { generateText } from "ai";
import { TITLE_GENERATOR_SYSTEM_PROMPT } from "@/config/system-prompts";
import { google } from "@ai-sdk/google";
import { generateId } from "ai";
import { gemish } from "@/ai/model";

// Background title generation with AI
async function queueTitleGeneration(
  chatId: string,
  messageText: string,
  userId: string
) {
  setTimeout(async () => {
    try {
      const { text: title } = await generateText({
        model: gemish.languageModel("fast"),
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        prompt: `Generate a title for the following conversation: ${messageText}`,
      });

      await db
        .update(chat)
        .set({ title })
        .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
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
  const query = searchParams.get("query") || "";
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const chats = await db.query.chat.findMany({
    where: and(
      eq(chat.userId, session.user.id),
      ilike(chat.title, `%${query}%`)
    ),
    limit,
    offset,
    orderBy: desc(chat.updatedAt),
  });

  // Get the total count without limit and offset
  const totalCountResult = await db
    .select({ count: count() })
    .from(chat)
    .where(
      and(eq(chat.userId, session.user.id), ilike(chat.title, `%${query}%`))
    );

  const totalCount = totalCountResult[0]?.count || 0;

  // Calculate if there are more results
  const hasMore = offset + chats.length < totalCount;

  return NextResponse.json(
    {
      chats,
      totalCount,
      hasMore,
    },
    { status: 200 }
  );
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
      // Create the chat
      await tx.insert(chat).values({
        id,
        title: "(New Chat)",
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
