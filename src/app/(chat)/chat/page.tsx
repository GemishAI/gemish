"use client";

import { StartChat } from "@/components/chat/start-chat";
import { useChat } from "@/providers/chat-provider";
import { useEffect } from "react";

export default function ChatPage() {
  const { setActiveChat } = useChat();

  // Clear active chat when visiting the start chat page
  useEffect(() => {
    setActiveChat(null);
  }, [setActiveChat]);

  return (
    <div className="flex flex-col gap-10 pt-24  w-full min-h-screen">
      <StartChat />
    </div>
  );
}
