import {
  Message as MessageComponent,
  MessageAvatar,
} from "@/components/prompt-kit/message";
import { Loader } from "@/components/prompt-kit/loader";
import type { Message } from "ai";

export function AILoading() {
  return (
    <MessageComponent className="justify-start">
      <MessageAvatar src="/avatars/gemini.png" alt="AI" fallback="AI" />
      <Loader text="Thinking" variant="loading-dots" size="md" />
    </MessageComponent>
  );
}
