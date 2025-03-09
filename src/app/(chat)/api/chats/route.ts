import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat } from "@/server/db/schema";
import { headers } from "next/headers";
import { and, eq, like } from "drizzle-orm";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { generateId } from "better-auth";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { count, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const searchTerm = searchParams.get("search") || "";

  let query = db.select().from(chat).where(eq(chat.userId, session.user.id));

  // Get total count for pagination
  const totalResult = await db
    .select({ count: count() })
    .from(chat)
    .where(eq(chat.userId, session.user.id))
    .execute();

  const total = totalResult[0].count;

  // Get paginated results
  const chats = await query
    .limit(limit)
    .offset(offset)
    .orderBy(desc(chat.updatedAt))
    .execute();

  return NextResponse.json({
    chats,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + chats.length < total,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, id }: { message: string; id: string } = body;

  console.log(message);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("createing chat in db");
    await db.insert(chat).values({
      id,
      title: "New Chat",
      userId: session.user.id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("created chat to db");

    // Do this function after the title has been returned
    after(async () => {
      // Generate title after the chat is created
      const { text: title } = await generateText({
        model: google("gemini-2.0-flash-lite-preview-02-05"),
        system:
          "You are a title generator. Create a concise, professional title of this conversation summarizing the main topic of this conversation. Avoid vague, abstract, or artistic phrases. The title should be clear and relevant.",
        prompt: `Generate a title for the following conversation: ${message}`,
      });

      // Update the title in the database
      await db
        .update(chat)
        .set({ title })
        .where(and(eq(chat.id, id), eq(chat.userId, session.user.id)));

      // Revalidate all data
      revalidatePath("/", "layout");
    });
    console.log(id, "returned data");

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
