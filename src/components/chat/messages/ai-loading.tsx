import {
  Message as MessageComponent,
  MessageAvatar,
} from "@/components/prompt-kit/message";
import { Loader } from "@/components/prompt-kit/loader";
import type { Message } from "ai";

interface AILoadingProps {
  status: "submitted" | "error" | "ready" | "streaming";
  messages: Message[];
}

export function AILoading({ status, messages }: AILoadingProps) {
  return (
    <>
      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <MessageComponent className="justify-start">
            <MessageAvatar src="/avatars/gemini.png" alt="AI" fallback="AI" />
            <Loader text="Thinking" variant="loading-dots" size="md" />
          </MessageComponent>
        )}
    </>
  );
}
