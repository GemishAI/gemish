import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "../ui/button";
import {
  Globe,
  Brain,
  Paperclip,
  ArrowUpIcon,
  Loader2Icon,
  Square,
  X,
  FileText,
} from "lucide-react";
import { type DebouncedState } from "use-debounce";
import { ChatInputFiles } from "./chat-input-files";

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
  removeFile,
}: ChatInputProps) {
  return (
    <PromptInput
      className="border-input bg-background border shadow-xs"
      value={input}
      onValueChange={handleValueChange}
      onSubmit={handleSend}
    >
      {fileList.length > 0 && (
        <ChatInputFiles fileList={fileList} removeFile={removeFile} />
      )}
      <PromptInputTextarea
        placeholder="Ask anything..."
        className="min-h-[55px]"
        onKeyDown={handleKeyDown}
        disabled={status !== "ready"}
      />
      <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <PromptInputAction tooltip="Attach files">
            <Button
              size="sm"
              variant={"outline"}
              className="h-9 w-9 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                multiple
                ref={fileInputRef}
              />
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
            tooltip={
              status === "submitted"
                ? "Submitting..."
                : status === "streaming"
                  ? "Stop generating"
                  : "Send message"
            }
          >
            {status === "submitted" ? (
              <Button size="sm" className="h-9 w-9 rounded-full" disabled>
                <Loader2Icon className="size-5 animate-spin" />
              </Button>
            ) : status === "streaming" ? (
              <Button size="sm" className="h-9 w-9 rounded-full" onClick={stop}>
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-9 w-9 rounded-full"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <ArrowUpIcon className="size-5" />
              </Button>
            )}
          </PromptInputAction>
        </div>
      </PromptInputActions>
    </PromptInput>
  );
}
