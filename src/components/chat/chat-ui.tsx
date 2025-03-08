"use client";

import { StartChat } from "@/components/chat/start-chat";
import type { Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { useState, useRef } from "react";
import { ChatInterface } from "./chat-interface";

export function ChatUI({
  initialMessages,
  id,
}: {
  initialMessages: Message[];
  id: string;
}) {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleSubmit, setInput, status, stop } = useChat({
    api: "/api/ai",
    id,
    initialMessages,
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], id };
    },
  });

  return (
    <div className="w-full flex flex-col">
      {messages.length === 0 && (
        <StartChat
          id={id}
          fileInputRef={fileInputRef}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          files={files}
          setFiles={setFiles}
        />
      )}
      {messages.length > 0 && (
        <ChatInterface
          messages={messages}
          fileInputRef={fileInputRef}
          stop={stop}
          handleSubmit={handleSubmit}
          status={status}
          input={input}
          setInput={setInput}
          files={files}
          setFiles={setFiles}
          key={id}
        />
      )}
    </div>
  );
}
