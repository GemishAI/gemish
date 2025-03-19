"use client";

import type React from "react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useChat } from "@/providers/chat-provider";
import { useDebouncedCallback } from "use-debounce";
import { ChatInput } from "./chat-input";
import { PromptSuggestion } from "@/components/prompt-kit/prompt-suggestion";
import { BrainIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function StartChat() {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<"submitted" | "ready">("ready");
  const [activeCategory, setActiveCategory] = useState("");

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

  // Get the first name only
  const firstName = session?.user?.name?.split(" ")[0] || "";

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

    return timeGreeting;
  }, [currentHour]);

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

  // Toggle active category
  const toggleCategory = (category: string) => {
    setActiveCategory((prev) => (prev === category ? "" : category));
  };

  // Handle click on suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Uncomment to auto-send when suggestion is clicked
    // setTimeout(() => handleSend(), 100);
  };

  // Get active category data
  const activeCategoryData = suggestionGroups.find(
    (group) => group.label === activeCategory
  );

  // Get a flattened list of all suggestions for default view
  const defaultSuggestions =
    activeCategory === ""
      ? suggestionGroups.flatMap(
          (group) => group.items.slice(0, 1) // Take first item from each category for default view
        )
      : [];

  // Render suggestion item with separator
  const renderSuggestionItem = (
    suggestion: string,
    index: number,
    items: string[],
    highlight?: string
  ) => {
    const isLast = index === items.length - 1;

    return (
      <motion.div
        key={suggestion}
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <PromptSuggestion
          highlight={highlight}
          onClick={() => handleSuggestionClick(suggestion)}
          className="text-xl w-full"
        >
          {suggestion}
        </PromptSuggestion>
        {!isLast && <div className="border-b border-gray-200 mt-2 mb-2"></div>}
      </motion.div>
    );
  };

  return (
    <motion.div
      className="flex flex-col w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top section with greeting */}
      <motion.div
        className="flex-none mb-4 space-y-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="lg:text-4xl text-3xl font-medium lg:mb-8 mb-4 justify-start">
          {greeting},{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>

        {/* Categories and suggestions section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-wrap items-stretch justify-start gap-2 mb-6">
            {suggestionGroups.map((suggestion, index) => (
              <motion.div
                key={suggestion.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <PromptSuggestion
                  onClick={() => toggleCategory(suggestion.label)}
                  className={`capitalize ${
                    activeCategory === suggestion.label
                      ? "bg-blue-100 dark:bg-blue-700 border-blue-400 dark:border-blue-800 text-blue-800 dark:text-blue-50"
                      : ""
                  }`}
                >
                  <BrainIcon className="mr-2 h-4 w-4" />
                  {suggestion.label}
                </PromptSuggestion>
              </motion.div>
            ))}
          </div>

          {/* Show category-specific suggestions when a category is active */}
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div
                key="active-category"
                className="flex w-full flex-col mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeCategoryData?.items.map((suggestion, index, items) =>
                  renderSuggestionItem(
                    suggestion,
                    index,
                    items,
                    activeCategoryData.highlight
                  )
                )}
              </motion.div>
            ) : (
              <motion.div
                key="default-suggestions"
                className="flex w-full flex-col mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {defaultSuggestions.map((suggestion, index, items) => {
                  const group =
                    suggestionGroups[index % suggestionGroups.length];
                  return renderSuggestionItem(
                    suggestion,
                    index,
                    items,
                    group.highlight
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Spacer to push input to bottom */}
      <div className="flex-grow"></div>

      {/* Chat input at the bottom */}
      <motion.div
        className="flex-none w-full mt-auto sticky bottom-0 pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
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
      </motion.div>
    </motion.div>
  );
}

const suggestionGroups = [
  {
    label: "Quick Summaries",
    highlight: "Summarize Instantly",
    items: [
      "Get a document summary",
      "Summarize a video transcript",
      "Condense a podcast episode",
      "Quickly understand a book",
    ],
  },
  {
    label: "Code Assistance",
    highlight: "Code Smarter",
    items: [
      "Generate React components",
      "Debug and fix code errors",
      "Learn Python interactively",
      "Master SQL queries",
    ],
  },
  {
    label: "Design & Create",
    highlight: "Design in Seconds",
    items: [
      "Create a logo concept",
      "Design a compelling hero section",
      "Design a landing page layout",
      "Design engaging social media posts",
    ],
  },
  {
    label: "In-Depth Research",
    highlight: "Research with Precision",
    items: [
      "Discover SEO best practices",
      "Find the perfect running shoes",
      "Explore top restaurants in Paris",
      "Research the latest AI tools",
    ],
  },
];
