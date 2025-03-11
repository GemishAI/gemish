"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "@/lib/context/chat-context";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const { handleSubmit, pendingMessages } = useChat();

  // Auto-trigger AI response for pending messages
  useEffect(() => {
    if (id && pendingMessages[id]) {
      // Automatically trigger the AI response for the pending message
      // Small delay to ensure the UI is ready
      const timer = setTimeout(() => {
        handleSubmit();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [id, pendingMessages, handleSubmit]);

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex items-center justify-center pt-4">
      <ChatInterface id={id} />
    </div>
  );
}
