import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/prompt-kit/message";

import { Button } from "@/components/ui/button";
interface AIErrorMessageProps {
  reload: () => void;
}

export function AIErrorMessage({ reload }: AIErrorMessageProps) {
  return (
    <Message className="justify-start">
      <MessageAvatar src="/avatars/gemini.png" alt="AI" fallback="AI" />
      <MessageContent className="h-fit bg-destructive/10 text-destructive py-3 px-4 max-w-[80%] rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-alert-circle"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-medium">Something went wrong</span>
          </div>
          <p className="text-sm text-destructive/80">
            We couldn't process your request. Please try again.
          </p>
          <Button
            type="button"
            onClick={() => reload()}
            variant="outline"
            size="sm"
            className="mt-2 bg-background hover:bg-background/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-cw mr-2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Try Again
          </Button>
        </div>
      </MessageContent>
    </Message>
  );
}
