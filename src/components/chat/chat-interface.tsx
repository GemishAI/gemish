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
import Image from "next/image";

interface ChatInterfaceProps {
  id: string;
}

export function ChatInterface({ id }: ChatInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div className="w-full h-screen flex flex-col">
      {isChatLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoaderSpinner width="20" height="20" />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto relative">
            <ChatContainer
              ref={containerRef}
              className="w-full px-4 pt-4 pb-4 space-y-6"
            >
              {messages.map((message) => (
                <MessageComponent
                  key={message.id}
                  className={
                    message.role === "user" ? "justify-end" : "justify-start"
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
                    <MessageContent className="h-fit bg-secondary text-foreground py-2 px-4 max-w-[80%] rounded-xl">
                      {message.content}
                    </MessageContent>
                  ) : (
                    <ChatMarkdown content={message.content} />
                  )}
                  <div>
                    {message?.experimental_attachments
                      ?.filter(
                        (attachment) =>
                          attachment?.contentType?.startsWith("image/") ||
                          attachment?.contentType?.startsWith("application/pdf")
                      )
                      .map((attachment, index) =>
                        attachment.contentType?.startsWith("image/") ? (
                          <Image
                            key={`${message.id}-${index}`}
                            src={attachment.url}
                            width={500}
                            height={500}
                            alt={attachment.name ?? `attachment-${index}`}
                          />
                        ) : attachment.contentType?.startsWith(
                            "application/pdf"
                          ) ? (
                          <iframe
                            key={`${message.id}-${index}`}
                            src={attachment.url}
                            width={500}
                            height={600}
                            title={attachment.name ?? `attachment-${index}`}
                          />
                        ) : null
                      )}
                  </div>
                </MessageComponent>
              ))}

              <AIErrorMessage error={error} reload={reload} />

              <AILoading status={status} messages={messages} />

              <div ref={bottomRef} />
            </ChatContainer>
            <div className="absolute bottom-4 right-4">
              <ScrollButton containerRef={containerRef} scrollRef={bottomRef} />
            </div>
          </div>
        </>
      )}
      <div className="w-full pb-6 bg-background border-t">
        <div className="max-w-3xl w-full mx-auto px-4">
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
