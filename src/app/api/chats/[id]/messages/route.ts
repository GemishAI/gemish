import { auth } from "@/auth/server/auth";
import { env } from "@/env.mjs";
import {
  getCompressed,
  invalidateChatMessagesCache,
  invalidateUserChatListCache,
  setCompressed,
} from "@/lib/redis";
import { db } from "@/server/db";
import { validateChatOwnership } from "@/server/db/message-loader";
import { message } from "@/server/db/schema";
import { withUnkey } from "@unkey/nextjs";
import { generateId } from "ai";
import { asc, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: chatId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First verify the chat belongs to the user
    const chatRecord = await validateChatOwnership(chatId, session.user.id);

    if (!chatRecord) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Include user ID and pagination in the cache key for security and proper caching
    const cacheKey = `user:${session.user.id}:chat:${chatId}:messages:page${page}:limit${limit}`;

    // Try to get messages from cache first using the compression utility
    const cachedMessages = await getCompressed(cacheKey);

    if (cachedMessages) {
      return NextResponse.json({
        messages: cachedMessages.messages,
        pagination: cachedMessages.pagination,
      });
    }

    // If not in cache, fetch from database with pagination
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(asc(message.createdAt))
      .limit(limit)
      .offset(offset)
      .execute();

    // Get total count for pagination info
    const countResult = await db
      .select({ value: count() })
      .from(message)
      .where(eq(message.chatId, chatId))
      .execute();

    const totalCount = countResult[0]?.value || 0;
    const hasMore = offset + messages.length < totalCount;

    // Transform database messages to AI SDK message format
    const aiMessages = messages.map(({ chatId, updatedAt, ...msg }) => ({
      ...msg,
      experimental_attachments: msg.experimental_attachments || undefined,
    }));

    // Prepare the response data structure
    const responseData = {
      messages: aiMessages,
      pagination: {
        page,
        limit,
        hasMore,
        totalCount,
      },
    };

    // For really large messages, we need to be careful with caching
    // Let's estimate the size and only cache if it's reasonable
    const messageString = JSON.stringify(responseData);
    const estimatedSizeKB = messageString.length / 1024;

    // Only cache if the estimated size is under 800KB (allowing for compression overhead)
    if (estimatedSizeKB < 800) {
      await setCompressed(cacheKey, responseData, { ex: 120 });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
};

export const POST = withUnkey(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id: chatId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Verify chat ownership
      const chatRecord = await validateChatOwnership(chatId, session.user.id);
      if (!chatRecord) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      const body = await request.json();
      const { message: messageText } = body;

      if (!messageText) {
        return NextResponse.json(
          { error: "Message content is required" },
          { status: 400 }
        );
      }

      // Create the message
      const messageId = generateId();
      await db.insert(message).values({
        id: messageId,
        chatId,
        role: "user",
        content: messageText,
        createdAt: new Date(),
        updatedAt: new Date(),
        annotations: [],
        parts: [],
        experimental_attachments: [],
      });

      // Invalidate the cache for this chat's messages
      await invalidateChatMessagesCache(session.user.id, chatId);

      // Also invalidate the chat list cache since the chat's updatedAt will change
      await invalidateUserChatListCache(session.user.id);

      return NextResponse.json({
        id: messageId,
        role: "user",
        content: messageText,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }
  },
  { apiId: env.UNKEY_API_ID }
);
