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
import { motion, AnimatePresence } from "motion/react";

interface ChatInterfaceProps {
  id: string;
}

export function ChatInterface({ id }: ChatInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    <motion.div
      className="w-full h-screen flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isChatLoading ? (
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoaderSpinner width="20" height="20" />
        </motion.div>
      ) : (
        <ChatContainer ref={containerRef} className="space-y-8 flex-1 py-5">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1 > 0.5 ? 0.5 : index * 0.1, // Cap delay at 0.5s
                }}
              >
                <MessageComponent
                  className={
                    message.role === "user" ? "justify-end" : "justify-start"
                  }
                >
                  {message.role === "assistant" && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageAvatar
                        src="/avatars/gemini.png"
                        alt="AI"
                        fallback="AI"
                      />
                    </motion.div>
                  )}
                  {message.role === "user" ? (
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageContent className="h-fit bg-secondary text-foreground py-2 px-4 max-w-[80%] rounded-xl">
                        {message.content}
                      </MessageContent>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <ChatMarkdown content={message.content} />
                    </motion.div>
                  )}
                </MessageComponent>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AIErrorMessage error={error} reload={reload} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status === "loading" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AILoading status={status} messages={messages} />
              </motion.div>
            )}
          </AnimatePresence>
        </ChatContainer>
      )}
      <motion.div
        className="w-full bg-background sticky bottom-0 z-10 inset-x-0 pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
        <AnimatePresence>
          {messages.length > 4 && (
            <motion.div
              className="flex justify-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollButton containerRef={containerRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
