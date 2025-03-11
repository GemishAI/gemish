"use client";

import type React from "react";

import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { Paperclip, X, Brain, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useChat } from "@/lib/context/chat-context";
import { useDebouncedCallback } from "use-debounce";

export function StartChat() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use the centralized chat context
  const { input, setInput, createChat } = useChat();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set up time update interval
  useEffect(() => {
    // Check for hour changes
    const checkHourChange = () => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
      }
    };

    // Set interval to check every minute
    intervalRef.current = setInterval(checkHourChange, 60000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentHour]);

  // Calculate greeting with useMemo to prevent recalculations
  const greeting = useMemo(() => {
    let timeGreeting = "";

    if (currentHour >= 5 && currentHour < 12) {
      timeGreeting = "Good morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      timeGreeting = "Good afternoon";
    } else {
      timeGreeting = "Good evening";
    }

    // Get the first name only
    const firstName = session?.user?.name?.split(" ")[0] || "";

    // Return the greeting with comma and first name if available
    return firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
  }, [currentHour, session?.user?.name]);

  const handleSend = useDebouncedCallback(async () => {
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Create a new chat with the initial message
      const chatId = await createChat(input);

      // Navigate after the chat is created
      router.push(`/chat/${chatId}`);
    } catch (error) {
      toast.error(
        "Unable to start a new chat. Please check your connection and try again."
      );
      console.error("Chat creation failed:", error);
    } finally {
      setIsSubmitting(false); // Ensure this resets even if there’s an error
    }
  }, 300);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  const handleValueChange = (value: string) => {
    setInput(value);
  };

  if (!session) return null;

  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="text-4xl font-medium text-center mb-6">{greeting}</h1>

      <div className="flex w-full flex-col space-y-4">
        <PromptInput
          className="border-input bg-background border shadow-xs"
          value={input}
          onValueChange={handleValueChange}
          onSubmit={handleSend}
        >
          <PromptInputTextarea
            placeholder="Ask anything..."
            className="min-h-[55px]"
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
          <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <PromptInputAction tooltip="Attach files">
                <Button
                  size="sm"
                  variant={"outline"}
                  className="h-8 w-8 rounded-full"
                >
                  <Paperclip className="text-primary size-5" />
                </Button>
              </PromptInputAction>

              <Button
                size="sm"
                variant={"outline"}
                className="h-9 w-fit rounded-full "
              >
                <Globe className="text-primary size-5" />
                Search
              </Button>

              <Button
                size="sm"
                variant={"outline"}
                className="h-9 w-fit rounded-full"
              >
                <Brain className="text-primary size-5" />
                Think
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <PromptInputAction
                tooltip={isSubmitting ? "Submitting..." : "Send message"}
              >
                {isSubmitting ? (
                  <Button size="sm" className="h-9 w-9 rounded-full" disabled>
                    <Loader2Icon className="size-5 animate-spin" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 w-8 rounded-full"
                    onClick={handleSend}
                    disabled={!input.trim()}
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </Button>
                )}
              </PromptInputAction>
            </div>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
