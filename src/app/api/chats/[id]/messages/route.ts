import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { message } from "@/server/db/schema";
import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";
import { validateChatOwnership } from "@/server/db/message-loader";
import { getCompressed, setCompressed } from "@/lib/redis";
import limiter from "@/lib/ratelimit";
import { env } from "@/env.mjs";
import { withUnkey } from "@unkey/nextjs";

export const GET = withUnkey(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id: chatId } = await params;

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ratelimit = await limiter.limit(session.user.id);

    if (!ratelimit.success) {
      return new NextResponse("Please try again later", { status: 429 });
    }

    try {
      // First verify the chat belongs to the user
      const chatRecord = await validateChatOwnership(chatId, session.user.id);

      if (!chatRecord) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      // Include user ID in the cache key for security
      const cacheKey = `user:${session.user.id}:chat:${chatId}:messages`;

      // Try to get messages from cache first using the compression utility
      const cachedMessages = await getCompressed(cacheKey);

      if (cachedMessages) {
        return NextResponse.json({ messages: cachedMessages });
      }

      // If not in cache, fetch from database
      const messages = await db
        .select()
        .from(message)
        .where(eq(message.chatId, chatId))
        .orderBy(asc(message.createdAt))
        .execute();

      // Transform database messages to AI SDK message format
      const aiMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt), // Explicitly create a Date object
        experimental_attachments: msg.experimental_attachments || undefined,
      }));

      // Cache the result with compression
      await setCompressed(cacheKey, aiMessages, { ex: 120 });

      return NextResponse.json({ messages: aiMessages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch chat messages" },
        { status: 500 }
      );
    }
  },
  { apiId: env.UNKEY_API_ID }
);
