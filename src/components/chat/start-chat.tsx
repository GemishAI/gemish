"use client";

import type React from "react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useChat } from "@/providers/chat-provider";
import { useDebouncedCallback } from "use-debounce";
import { ChatInput } from "./chat-input";

export function StartChat() {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<"submitted" | "ready">("ready");

  // Use the centralized chat context
  const {
    input,
    setInput,
    createChat,
    stop,
    fileInputRef,
    handleFileChange,
    fileList,
    removeFile,
  } = useChat();

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
    if (!input.trim() || status === "submitted") return;

    setStatus("submitted");

    try {
      // Create a new chat with the initial message
      await createChat(input);
    } catch (error) {
      toast.error(
        "Unable to start a new chat. Please check your connection and try again."
      );
      console.error("Chat creation failed:", error);
    } finally {
      setStatus("ready");
    }
  }, 300);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  const handleValueChange = useCallback(
    (value: string) => setInput(value),
    [setInput]
  );

  return (
    <div className="flex flex-col w-full h-full ">
      <h1 className="text-4xl font-medium text-center mb-10">{greeting}</h1>

      <div className="flex w-full flex-col space-y-4">
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
  );
}
