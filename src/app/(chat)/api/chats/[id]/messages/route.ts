import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat, message } from "@/server/db/schema";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";
import { validateChatOwnership } from "@/server/db/message-loader";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First verify the chat belongs to the user

    const chatRecord = await validateChatOwnership(chatId, session.user.id);

    if (chatRecord) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Fetch all messages for this chat
    const cachedMessages = cache(
      async () => {
        return await db
          .select()
          .from(message)
          .where(eq(message.chatId, chatId))
          .orderBy(asc(message.createdAt))
          .execute();
      },
      [`chat-messages-${chatId}`],
      { revalidate: 3600, tags: [`chat-messages-${chatId}`] }
    );

    const messages = await cachedMessages();

    // Transform database messages to AI SDK message format
    const aiMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(msg.createdAt), // Explicitly create a Date object
      experimental_attachments: msg.experimental_attachments || undefined,
    }));

    return NextResponse.json({ messages: aiMessages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}
