"use client";

import { useChat } from "@/chat/chat-provider";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, Brain, Globe, Loader2Icon, Square } from "lucide-react";
import React from "react";
import { type DebouncedState } from "use-debounce";
import { Button } from "../ui/button";

interface ChatInputProps {
  input: string;
  handleValueChange: (value: string) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  handleSend: DebouncedState<() => Promise<void>>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  stop: () => void;
}

export function ChatInput({
  input,
  status,
  handleValueChange,
  handleSend,
  handleKeyDown,
  stop,
}: ChatInputProps) {
  const {
    isSearchActive,

    isThinkActive,

    setModelState,
    toggleSearch,
    toggleThink,
  } = useChat();

  // Define the gradient styles for the active buttons

  const searchButtonGradient = isSearchActive
    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
    : "bg-transparent";

  const thinkButtonGradient = isThinkActive
    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
    : "bg-transparent";

  // Use dropzone's open instead of clicking the file input directly
  const handleAttachClick = () => {
    if (status === "ready") {
      open();
    }
  };

  return (
    <PromptInput
      className="border-input bg-background border shadow-xs"
      value={input}
      onValueChange={handleValueChange}
      onSubmit={handleSend}
    >
      <PromptInputTextarea
        placeholder="Ask anything..."
        className="min-h-[55px] dark:text-white text-black"
        onKeyDown={handleKeyDown}
        disabled={status !== "ready"}
      />
      <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isSearchActive ? "default" : "outline"}
            className={cn("h-9 w-fit rounded-full", searchButtonGradient)}
            onClick={toggleSearch}
          >
            <Globe
              className={cn("size-5", isSearchActive ? "text-white" : "")}
            />
            Search
          </Button>

          <Button
            size="sm"
            variant={isThinkActive ? "default" : "outline"}
            className={cn("h-9 w-fit rounded-full", thinkButtonGradient)}
            onClick={toggleThink}
          >
            <Brain
              className={cn(
                "size-5",
                isThinkActive ? "text-white" : "text-primary"
              )}
            />
            Think
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <PromptInputAction
            tooltip={
              status === "submitted"
                ? "Submitting..."
                : status === "streaming"
                ? "Stop generating"
                : "Send message"
            }
          >
            {status === "submitted" ? (
              <Button
                size="sm"
                className="lg:h-9 lg:w-9 h-8 w-8 rounded-full"
                disabled
              >
                <Loader2Icon className="lg:size-5 size-4 animate-spin" />
              </Button>
            ) : status === "streaming" ? (
              <Button size="sm" className="h-9 w-9 rounded-full" onClick={stop}>
                <Square className="lg:size-4 size-3 fill-current" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="lg:h-9 lg:w-9 h-8 w-8 rounded-full"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <ArrowUpIcon className="lg:size-5 size-4" />
              </Button>
            )}
          </PromptInputAction>
        </div>
      </PromptInputActions>
    </PromptInput>
  );
}
