"use client";

import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { PromptSuggestion } from "@/components/prompt-kit/prompt-suggestion";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, BrainIcon, Loader2Icon, Square } from "lucide-react";
import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { type ChatRequestOptions } from "ai";
import { useRouter } from "next/navigation";

interface ChatInputProps {
  id: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  input: string;
  setInput: (input: string) => void;
  files: FileList | undefined;
  setFiles: React.Dispatch<React.SetStateAction<FileList | undefined>>;
}

export function StartChat({
  id,
  handleSubmit,
  input,
  setInput,
  files,
  setFiles,
  fileInputRef,
}: ChatInputProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (files) {
      const dt = new DataTransfer();
      Array.from(files).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setFiles(dt.files);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    }
  };

  const handleSend = async () => {
    setIsSubmitting(true);
    if (input.trim()) {
      await fetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({
          message: input,
          id: id,
        }),
      }).finally(() => {
        setIsSubmitting(false);
      });

      router.push(`/chat/${id}`);
      handleSubmit(event, {
        experimental_attachments: files,
      });
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setActiveCategory("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptInputValueChange = (value: string) => {
    setInput(value);
    // Clear active category when typing something different
    if (value.trim() === "") {
      setActiveCategory("");
    }
  };

  // Get suggestions based on active category
  const activeCategoryData = suggestionGroups.find(
    (group) => group.label === activeCategory
  );

  // Determine which suggestions to show
  const showCategorySuggestions = activeCategory !== "";
  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="text-3xl font-semibold text-center mb-6">
        What's on your mind?
      </h1>

      <div className="flex w-full flex-col space-y-4">
        <PromptInput
          className="border-input bg-background border shadow-xs"
          value={input}
          onValueChange={handlePromptInputValueChange}
          onSubmit={handleSend}
        >
          {files && files.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                >
                  <Paperclip className="size-4" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="hover:bg-secondary/50 rounded-full p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <PromptInputTextarea
            placeholder="Ask anything..."
            className="min-h-[44px]"
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
          <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
            <PromptInputAction tooltip="Attach files">
              <label
                htmlFor="file-upload"
                className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="file-upload"
                />
                <Paperclip className="text-primary size-5" />
              </label>
            </PromptInputAction>

            <PromptInputAction
              tooltip={isSubmitting ? "Submitting..." : "Send message"}
            >
              {isSubmitting ? (
                <Button size="sm" className="h-9 w-9 rounded-full" disabled>
                  <Loader2Icon className="size-5  animate-spin" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-9 w-9 rounded-full"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
              )}
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>

        <div className="relative flex w-full flex-col items-center justify-center space-y-2">
          <div className="absolute top-0 left-0 h-[70px] w-full mx-auto">
            {showCategorySuggestions ? (
              <div className="flex w-full flex-col space-y-1 ">
                {activeCategoryData?.items.map((suggestion) => (
                  <PromptSuggestion
                    key={suggestion}
                    highlight={activeCategoryData.highlight}
                    onClick={() => {
                      setInput(suggestion);
                      // Optional: auto-send
                      // handleSend()
                    }}
                  >
                    {suggestion}
                  </PromptSuggestion>
                ))}
              </div>
            ) : (
              <div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
                {suggestionGroups.map((suggestion) => (
                  <PromptSuggestion
                    key={suggestion.label}
                    onClick={() => {
                      setActiveCategory(suggestion.label);
                      setInput(""); // Clear input when selecting a category
                    }}
                    className="capitalize"
                  >
                    <BrainIcon className="mr-2 h-4 w-4" />
                    {suggestion.label}
                  </PromptSuggestion>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const suggestionGroups = [
  {
    label: "Summary",
    highlight: "Summarize",
    items: [
      "Summarize a document",
      "Summarize a video",
      "Summarize a podcast",
      "Summarize a book",
    ],
  },
  {
    label: "Code",
    highlight: "Help me",
    items: [
      "Help me write React components",
      "Help me debug code",
      "Help me learn Python",
      "Help me learn SQL",
    ],
  },
  {
    label: "Design",
    highlight: "Design",
    items: [
      "Design a small logo",
      "Design a hero section",
      "Design a landing page",
      "Design a social media post",
    ],
  },
  {
    label: "Research",
    highlight: "Research",
    items: [
      "Research the best practices for SEO",
      "Research the best running shoes",
      "Research the best restaurants in Paris",
      "Research the best AI tools",
    ],
  },
];
