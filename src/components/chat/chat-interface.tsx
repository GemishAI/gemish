"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  Message as MessageComponent,
  MessageAvatar,
  MessageContent,
} from "@/components/prompt-kit/message";
import { useChat } from "@/providers/chat-provider";
import { useDebouncedCallback } from "use-debounce";
import { ChatContainer } from "@/components/prompt-kit/chat-container";
import { ScrollButton } from "../prompt-kit/scroll-button";
import { ChatMarkdown } from "./chat-markdown";
import { ChatInput } from "./chat-input";
import { LoaderSpinner } from "../loader-spinner";
import { AIErrorMessage } from "./messages/ai-error-messge";
import { AILoading } from "./messages/ai-loading";
import { MessageAttachments } from "./messages/message-attachments";

interface ChatInterfaceProps {
  id: string;
}

export function ChatInterface({ id }: ChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
    stop,
    setActiveChat,
    isChatLoading,
    error,
    reload,
    fileInputRef,
    handleFileChange,
    fileList,
    removeFile,
  } = useChat();

  useEffect(() => {
    setActiveChat(id);
    return () => {
      submittedRef.current = false;
    };
  }, [id, setActiveChat]);

  const handleValueChange = useCallback(
    (value: string) => setInput(value),
    [setInput]
  );

  const safeSendMessage = useCallback(
    (event: React.FormEvent) => {
      if (submittedRef.current || !input.trim()) return;
      submittedRef.current = true;
      handleSubmit(event);
    },
    [input, handleSubmit]
  );

  const handleSend = useDebouncedCallback(
    (e: React.FormEvent) => {
      if (e) e.preventDefault();
      safeSendMessage(e);
    },
    300,
    { leading: true, trailing: false }
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        safeSendMessage(e);
      }
    },
    [safeSendMessage]
  );

  return (
    <div className="w-full h-screen relative flex flex-col">
      {isChatLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoaderSpinner width="20" height="20" />
        </div>
      ) : (
        <div className="flex h-screen w-full  flex-col overflow-hidden">
          <ChatContainer
            ref={chatContainerRef}
            autoScroll={true}
            className=" p-4 flex-1   space-y-8"
          >
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                className={
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start h-full"
                }
              >
                {message.role === "assistant" && (
                  <MessageAvatar
                    src="/avatars/gemini.png"
                    alt="AI"
                    fallback="AI"
                  />
                )}

                {message.role === "user" ? (
                  <div className="flex flex-col items-end w-full">
                    {message.experimental_attachments && (
                      <MessageAttachments
                        key={message.id}
                        messageId={message.id}
                        attachments={message.experimental_attachments}
                      />
                    )}
                    <MessageContent className="h-fit bg-secondary text-foreground py-2 px-4 max-w-[80%] rounded-xl">
                      {message.content}
                    </MessageContent>
                  </div>
                ) : (
                  <div className="w-full">
                    <ChatMarkdown key={message.id} content={message.content} />
                  </div>
                )}
              </MessageComponent>
            ))}

            <AIErrorMessage error={error} reload={reload} />

            <AILoading status={status} messages={messages} />
          </ChatContainer>
        </div>
      )}
      <div className="w-full pb-6 bg-background sticky bottom-0">
        <div className=" w-full mx-auto px-4">
          <ChatInput
            input={input}
            handleKeyDown={handleKeyDown}
            handleValueChange={handleValueChange}
            handleSend={handleSend}
            status={status}
            stop={stop}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            fileList={fileList}
            removeFile={removeFile}
          />
        </div>
      </div>
    </div>
  );
}
