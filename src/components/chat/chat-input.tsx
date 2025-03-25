"use client";

import React, { useEffect } from "react";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "../ui/button";
import { Paperclip, ArrowUpIcon, Loader2Icon, Square } from "lucide-react";
import { type DebouncedState } from "use-debounce";
import { ChatInputFiles } from "./chat-input-files";
import { useChat } from "@/chat/chat-provider";
import { Files as FilesIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

interface ChatInputProps {
  input: string;
  handleValueChange: (value: string) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  handleSend: DebouncedState<() => Promise<void>>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  stop: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileList: File[];
  removeFile: (file: File) => void;
}

export function ChatInput({
  input,
  status,
  handleValueChange,
  handleSend,
  handleKeyDown,
  stop,
  fileInputRef,
  handleFileChange,
  fileList,
}: ChatInputProps) {
  const { isUploading, dropzone } = useChat();
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = dropzone;

  // Use dropzone's open instead of clicking the file input directly
  const handleAttachClick = () => {
    if (status === "ready") {
      open();
    }
  };

  return (
    <div {...getRootProps()}>
      <PromptInput
        className="border-input bg-background border shadow-xs"
        value={input}
        onValueChange={handleValueChange}
        onSubmit={handleSend}
      >
        <input {...getInputProps()} />
        <div className="relative">
          {/* File list with animated presence */}
          <AnimatePresence>
            {fileList.length > 0 && (
              <motion.div
                className="file-list-container"
                initial={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  marginTop: 8,
                  marginBottom: 8,
                }}
                exit={{ height: 0, opacity: 0, marginTop: 0, marginBottom: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 },
                }}
              >
                <ChatInputFiles />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag overlay with animated presence - preserved original structure */}
          <AnimatePresence>
            {isDragActive && (
              <motion.div
                className={`
                  border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950/20 
                  rounded-lg flex items-center justify-center
                  ${fileList.length > 0 ? "absolute inset-0 z-10" : ""}
                `}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  backdropFilter: fileList.length > 0 ? "blur(8px)" : "none",
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 0.2,
                }}
              >
                <p
                  className={`text-blue-600 font-medium ${
                    isDragReject ? "text-red-500" : ""
                  }`}
                >
                  {isDragReject ? (
                    "Invalid files. Only images and PDFs up to 10MB are accepted."
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <FilesIcon size={20} />
                        <span>Drop Files here to add to chat</span>
                      </div>
                      <span className="text-xs text-blue-800">
                        Max 20 files per chat each 10MB (images or PDFs)
                      </span>
                    </div>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PromptInputTextarea
          placeholder="Ask anything..."
          className="min-h-[55px] dark:text-white text-black"
          onKeyDown={handleKeyDown}
          disabled={status !== "ready"}
        />
        <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
          <PromptInputAction tooltip="Attach files">
            <Button
              size="sm"
              variant={"outline"}
              className="h-9 w-9 rounded-full"
              onClick={handleAttachClick}
              disabled={status !== "ready"}
            >
              <Paperclip className="size-5" />
            </Button>
          </PromptInputAction>

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
                <Button
                  size="sm"
                  className="h-9 w-9 rounded-full"
                  onClick={stop}
                >
                  <Square className="lg:size-4 size-3 fill-current" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="lg:h-9 lg:w-9 h-8 w-8 rounded-full"
                  onClick={handleSend}
                  disabled={!input.trim() || isUploading}
                >
                  <ArrowUpIcon className="lg:size-5 size-4" />
                </Button>
              )}
            </PromptInputAction>
          </div>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
