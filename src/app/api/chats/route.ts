import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat } from "@/server/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { generateId } from "better-auth";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chats = await db.query.chat.findMany({
    where: eq(chat.userId, session.user.id),
  });

  return NextResponse.json(chats);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, id }: { message: string; id: string } = body;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text: title } = await generateText({
      model: google("gemini-2.0-flash-lite-preview-02-05"),
      system:
        "You are a title generator. Create a concise, professional title of this conversation summarizing the main topic of this conversation. Avoid vague, abstract, or artistic phrases. The title should be clear and relevant.",
      prompt: `Generate a title for the following conversation: ${message}`,
    });

    await db.insert(chat).values({
      id,
      title: title,
      userId: session.user.id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
