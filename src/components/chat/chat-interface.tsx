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
import { AISourcesList } from "./messages/ai-sources";
import { AIReasoning } from "./messages/ai-reasoning";

interface ChatInterfaceProps {
  id: string;
}

export function ChatInterface({ id }: ChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
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
    <div className="w-full h-full relative flex flex-col">
      {isChatLoading ?
        <div className="flex-1 flex items-center justify-center">
          <LoaderSpinner width="20" height="20" />
        </div>
      : <div className="flex min-h-screen pt-5 pb-20 w-full  flex-col overflow-hidden">
          <ChatContainer
            ref={chatContainerRef}
            autoScroll={true}
            className=" flex-1   space-y-8"
          >
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                className={
                  message.role === "user" ?
                    "justify-end"
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

                {message.role === "user" ?
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
                : <div className="w-full flex flex-col items-start gap-2">
                    {/* Reasoning Component */}
                    {message.parts &&
                      message.parts.filter((part) => part.type === "reasoning")
                        .length > 0 && (
                        <AIReasoning
                          reasoningParts={message.parts.filter(
                            (part) => part.type === "reasoning"
                          )}
                        />
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

                    {/* Check if sources exists in message.parts */}
                    {message.parts &&
                      message.parts.filter((part) => part.type === "source")
                        .length > 0 && (
                        <AISourcesList
                          sources={message.parts
                            .filter((part) => part.type === "source")
                            .map((part) => part.source)}
                        />
                      )}
                  </div>
                }
              </MessageComponent>
            ))}

            {/* show errror if there is error */}
            {error && <AIErrorMessage reload={reload} />}

            {status === "submitted" &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && <AILoading />}
          </ChatContainer>
        </div>
      }

      <div className="w-full  bg-background fixed pb-4 bottom-0 inset-x-0">
        <div className=" w-full mx-auto px-4 max-w-3xl">
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
