import { auth } from "@/auth/server/auth";
import { env } from "@/env.mjs";
import limiter from "@/lib/ratelimit";
import {
  invalidateChatMessagesCache,
  invalidateUserChatListCache,
} from "@/lib/redis";
import { db } from "@/server/db";
import { chat } from "@/server/db/schema";
import { withUnkey } from "@unkey/nextjs";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(100),
});

export const PATCH = withUnkey(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const ratelimit = await limiter.limit(session.user.id);

      if (!ratelimit.success) {
        return new NextResponse("Please try again later", { status: 429 });
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

      await Promise.all([
        db
          .update(chat)
          .set({ title: result.data.title })
          .where(and(eq(chat.id, id), eq(chat.userId, session.user.id))),

        invalidateUserChatListCache(session.user.id),
      ]);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating chat:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  { apiId: env.UNKEY_API_ID }
);

export const DELETE = withUnkey(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const ratelimit = await limiter.limit(session.user.id);

      if (!ratelimit.success) {
        return new NextResponse("Please try again later", { status: 429 });
      }

      const existingChat = await db.query.chat.findFirst({
        where: and(eq(chat.id, id), eq(chat.userId, session.user.id)),
      });

      if (!existingChat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      await Promise.all([
        db
          .delete(chat)
          .where(and(eq(chat.id, id), eq(chat.userId, session.user.id))),
        invalidateUserChatListCache(session.user.id),
        invalidateChatMessagesCache(session.user.id, id),
      ]);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting chat:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  { apiId: env.UNKEY_API_ID }
);
