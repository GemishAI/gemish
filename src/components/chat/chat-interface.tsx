"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  Message as MessageComponent,
  MessageAvatar,
  MessageContent,
} from "@/components/prompt-kit/message";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { ArrowUpIcon, Square } from "lucide-react";
import { useChat } from "@/lib/context/chat-context";
import { useDebouncedCallback } from "use-debounce";
import { ChatContainer } from "@/components/prompt-kit/chat-container";
import { ScrollButton } from "../prompt-kit/scroll-button";
import { ChatMarkdown } from "./chat-markdown";
import { Loader } from "../prompt-kit/loader";

interface ChatInterfaceProps {
  id: string;
}
// Reducer for managing streaming message state
function streamingReducer(
  state: string | null,
  action:
    | { type: "START_STREAMING"; messageId: string }
    | { type: "STOP_STREAMING" }
): string | null {
  switch (action.type) {
    case "START_STREAMING":
      return action.messageId;
    case "STOP_STREAMING":
      return null;
    default:
      return state;
  }
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
  } = useChat();

  useEffect(() => {
    setActiveChat(id);
    return () => {
      submittedRef.current = false;
    };
  }, [id, setActiveChat]);

  const handleInputChange = useCallback(
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

  const isInputDisabled = status === "submitted" || status === "streaming";

  return (
    <div className="w-full h-full ">
      <ChatContainer ref={containerRef} className="w-full p-4 space-y-6">
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            className={
              message.role === "user" ? "justify-end" : "justify-start"
            }
          >
            {message.role === "assistant" && (
              <MessageAvatar src="/avatars/gemini.png" alt="AI" fallback="AI" />
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

        {status === "submitted" &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <MessageComponent className="justify-start">
              <MessageAvatar src="/avatars/gemini.png" alt="AI" fallback="AI" />
              <Loader text="Thinking..." variant="text-shimmer" size="lg" />
            </MessageComponent>
          )}
      </ChatContainer>
      <div className="sticky bottom-0 inset-x-0 pb-6">
        <div className="max-w-3xl mx-auto px-4">
          <PromptInput
            className="border-input bg-background border shadow-xs"
            value={input}
            onValueChange={handleInputChange}
            onSubmit={handleSend}
          >
            <PromptInputTextarea
              placeholder="Ask anything..."
              className="min-h-[44px]"
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
            />
            <PromptInputActions className="flex items-center justify-end gap-2 pt-2">
              <PromptInputAction
                tooltip={isInputDisabled ? "Stop generation" : "Send message"}
              >
                {isInputDisabled ? (
                  <Button
                    size="sm"
                    className="h-8 w-8 rounded-full"
                    onClick={stop}
                  >
                    <Square className="size-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                  >
                    <ArrowUpIcon className="size-5" />
                  </Button>
                )}
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <ScrollButton containerRef={containerRef} scrollRef={bottomRef} />
      </div>
    </div>
  );
}
