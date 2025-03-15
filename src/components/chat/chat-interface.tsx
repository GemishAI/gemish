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

  const safeSendMessage = useCallback(() => {
    if (submittedRef.current || !input.trim()) return;
    submittedRef.current = true;
    handleSubmit();
  }, [input, handleSubmit]);

  const handleSend = useDebouncedCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();
      safeSendMessage();
    },
    300,
    { leading: true, trailing: false }
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        safeSendMessage();
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
          />
        </div>
      </div>
    </div>
  );
}
