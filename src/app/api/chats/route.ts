import { gemish } from "@/ai/model";
import { auth } from "@/auth/server/auth";
import { TITLE_GENERATOR_SYSTEM_PROMPT } from "@/config/system-prompts";
import { env } from "@/env.mjs";
import {
  getCompressed,
  invalidateChatMessagesCache,
  invalidateUserChatListCache,
  setCompressed,
} from "@/lib/redis";
import { db } from "@/server/db";
import { chat } from "@/server/db/schema";
import { withUnkey } from "@unkey/nextjs";
import { generateText } from "ai";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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

      await Promise.all([
        db
          .update(chat)
          .set({ title })
          .where(and(eq(chat.id, chatId), eq(chat.userId, userId))),

        invalidateUserChatListCache(userId),
      ]);
    } catch (error) {
      console.error("Title generation failed:", error);
    }
  }, 100); // Start right away but don't block response
}

// In your chat listing endpoint
export const GET = withUnkey(
  async (request: NextRequest) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Create a unique cache key based on user ID and query parameters
    const cacheKey = `chats:${session.user.id}:${query}:${limit}:${offset}`;

    // Try to get data from cache first using the compression utility
    const cachedData = await getCompressed(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Rest of your database fetch logic...
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

    // Prepare response data
    const responseData = {
      chats,
      totalCount,
      hasMore,
    };

    // Check size before caching to prevent Redis 1MB limit issues
    const dataString = JSON.stringify(responseData);
    const estimatedSizeKB = dataString.length / 1024;

    // Only cache if the estimated size is under 800KB (allowing for compression overhead)
    if (estimatedSizeKB < 800) {
      await setCompressed(cacheKey, responseData, { ex: 300 });
    }

    return NextResponse.json(responseData, { status: 200 });
  },
  { apiId: env.UNKEY_API_ID }
);

export const POST = async (request: NextRequest) => {
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
    });

    // Invalidate user chat cache
    await invalidateUserChatListCache(session.user.id);

    // If a message was created, also invalidate any message cache for this chat
    if (messageText) {
      await invalidateChatMessagesCache(session.user.id, id);
    }

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
};
