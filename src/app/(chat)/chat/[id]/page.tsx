import { ChatUI } from "@/components/chat/chat-ui";
import { loadChat } from "@/server/db/chat-store";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import type { Message } from "ai";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const data = await loadChat({ id, userId: session.user.id });

  const chat = data;

  return (
    <div className="w-full max-w-3xl mx-auto h-screen">
      <div className="pb-16">
        <ChatUI id={chat.id} initialMessages={chat.messages as Message[]} />
      </div>
    </div>
  );
}
