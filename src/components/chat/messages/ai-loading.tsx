import { Loader } from "@/components/prompt-kit/loader";
import {
  MessageAvatar,
  Message as MessageComponent,
} from "@/components/prompt-kit/message";
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
            <Loader variant="typing" size="lg" />
          </MessageComponent>
        )}
    </>
  );
}
