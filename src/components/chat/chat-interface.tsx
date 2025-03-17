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
import {
  Reasoning,
  ReasoningContent,
  ReasoningResponse,
  ReasoningTrigger,
} from "@/components/prompt-kit/reasoning";
import Link from "next/link";

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
                  <div className="py-1.5">
                    <MessageAvatar
                      src="/avatars/gemini.png"
                      alt="AI"
                      fallback="AI"
                    />
                  </div>
                )}

                {message.role === "user" ? (
                  <div className="flex flex-col items-end w-full gap-1">
                    {message.experimental_attachments && (
                      <MessageAttachments
                        key={message.id}
                        messageId={message.id}
                        attachments={message.experimental_attachments}
                      />
                    )}
                    <MessageContent className="h-fit bg-secondary text-foreground py-2 px-4 max-w-[80%] rounded-xl">
                      {/* Map over message.parts for user messages */}
                      {message.parts &&
                        message.parts.map((part, index) => {
                          if (part.type === "text") {
                            return <div key={index}>{part.text}</div>;
                          }
                          return null;
                        })}
                    </MessageContent>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-start gap-2">
                    {/* Check if reasoning exists in message.parts */}
                    {message.parts &&
                      message.parts.some(
                        (part) => part.type === "reasoning"
                      ) && (
                        <Reasoning>
                          <div className="flex w-full flex-col gap-3">
                            <ReasoningTrigger>Show reasoning</ReasoningTrigger>
                            <ReasoningContent className="ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700">
                              <ReasoningResponse
                                text={message.parts
                                  .filter((part) => part.type === "reasoning")
                                  .flatMap((part) =>
                                    part.details
                                      .filter(
                                        (detail) => detail.type === "text"
                                      )
                                      .map((detail) => detail.text)
                                  )
                                  .join("\n")}
                              />
                            </ReasoningContent>
                          </div>
                        </Reasoning>
                      )}

                    {/* Render text parts after reasoning */}
                    {message.parts &&
                      message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <ChatMarkdown
                              key={`text-${index}`}
                              content={part.text}
                            />
                          );
                        }
                        return null;
                      })}

                    {message.parts &&
                      message.parts
                        .filter((part) => part.type === "source")
                        .map((part, index) => (
                          <div
                            key={`source-${part.source.id}`}
                            className="flex items-center bg-gray-900 text-gray-200 rounded-md px-3 py-2"
                          >
                            <span className="mr-2 text-gray-400">
                              {index + 1}
                            </span>
                            <div className="flex flex-col">
                              <div className="text-sm font-medium">
                                {part.source.title ||
                                  new URL(part.source.url).hostname}
                              </div>
                              <div className="text-xs text-gray-400">
                                <Link
                                  href={part.source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {part.source.url}
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
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
