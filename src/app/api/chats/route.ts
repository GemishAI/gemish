
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { chat } from '@/server/db/schema';
import { headers } from "next/headers";
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
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
