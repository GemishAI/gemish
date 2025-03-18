import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat } from "@/server/db/schema";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const existingChat = await db.query.chat.findFirst({
      where: and(eq(chat.id, id), eq(chat.userId, session.user.id)),
    });

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await db
      .update(chat)
      .set({ title: result.data.title })
      .where(and(eq(chat.id, id), eq(chat.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingChat = await db.query.chat.findFirst({
      where: and(eq(chat.id, id), eq(chat.userId, session.user.id)),
    });

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await db
      .delete(chat)
      .where(and(eq(chat.id, id), eq(chat.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
