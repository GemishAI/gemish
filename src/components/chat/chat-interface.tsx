"use client";

import {
  Message as MessageComponent,
  MessageAvatar,
  MessageContent,
} from "@/components/prompt-kit/message";
import { Button } from "@/components/ui/button";
import { Message, ChatRequestOptions } from "ai";
import { useRef } from "react";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { Paperclip, X, ArrowUpIcon, Square } from "lucide-react";
import { ChatMarkdown } from "./chat-markdown";

interface ChatInterfaceProps {
  messages: Message[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  stop: () => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  input: string;
  setInput: (input: string) => void;
  files: FileList | undefined;
  setFiles: React.Dispatch<React.SetStateAction<FileList | undefined>>;
}

export function ChatInterface({
  messages,
  fileInputRef,
  stop,
  handleSubmit,
  status,
  input,
  setInput,
  files,
  setFiles,
}: ChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSend = () => {
    if (input.trim()) {
      console.log("Sending:", input);
      handleSubmit(event, {
        experimental_attachments: files,
      });
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
  };

  return (
    <div className=" h-screen w-full mt-20">
      <div ref={chatContainerRef} className="h-full w-full space-y-6">
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            className={
              message.role === "user" ? "justify-end" : "justify-start"
            }
          >
            {message.role === "assistant" && (
              <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
            )}
            {message.role === "user" ? (
              <MessageContent className="h-fit bg-secondary text-foreground py-2 px-4 max-w-[80%] rounded-xl">
                {message.content}
              </MessageContent>
            ) : (
              <div>
                {status === "streaming" && (
                  <ChatMarkdown key={message.id} content={message.content} />
                )}
                {status === "ready" && (
                  <ChatMarkdown key={message.id} content={message.content} />
                )}
                {status === "submitted" && <div>Thinking....</div>}
              </div>
            )}
          </MessageComponent>
        ))}
      </div>
      <div className="fixed bottom-0 w-full inset-x-0">
        <div className="flex w-full max-w-3xl mx-auto flex-col">
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
              disabled={status === "streaming" || status === "submitted"}
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
                tooltip={
                  status === "streaming" || status === "submitted"
                    ? "Stop generation"
                    : "Send message"
                }
              >
                {status === "streaming" || status === "submitted" ? (
                  <Button
                    size="sm"
                    className="h-9 w-9 rounded-full"
                    onClick={stop}
                  >
                    <Square className="size-5 fill-current" />
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
        </div>
      </div>
    </div>
  );
}
