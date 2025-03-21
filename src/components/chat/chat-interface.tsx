"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useChat } from "@/providers/chat-provider";
import {
  Message as MessageComponent,
  MessageAvatar,
  MessageContent,
} from "@/components/prompt-kit/message";
import { ChatContainer } from "@/components/prompt-kit/chat-container";
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
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [id, setActiveChat]);

  const handleSend = useDebouncedCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (input.trim()) {
        handleSubmit();
      }
    },
    300,
    { leading: true, trailing: false }
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleValueChange = useCallback(
    (value: string) => setInput(value),
    [setInput]
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {isChatLoading ?
        <div className="flex-1 flex items-center justify-center">
          <LoaderSpinner width="20" height="20" />
        </div>
      : <ChatContainer ref={containerRef} className="space-y-12 flex-1 py-5">
          {messages.map((message) => (
            <motion.div key={message.id}>
              <MessageComponent
                className={
                  message.role === "user" ? "justify-end" : "justify-start"
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
                  </div>
                }
              </MessageComponent>
            </motion.div>
          ))}

          {error && <AIErrorMessage error={error} reload={reload} />}

          {status === "submitted" && (
            <AILoading status={status} messages={messages} />
          )}
        </ChatContainer>
      }
      <motion.div
        className="w-full bg-background sticky bottom-0 z-10 inset-x-0 pb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="w-full">
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
      </motion.div>
    </div>
  );
}
