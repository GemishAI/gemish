"use client";

import { StartChat } from "@/components/chat/start-chat";
import { useChat } from "@/providers/chat-provider";
import { useEffect } from "react";

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-10 pt-24  w-full min-h-screen">
      <StartChat />
    </div>
  );
}
