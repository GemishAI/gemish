import React, { useState } from "react";

import {
  Reasoning,
  ReasoningContent,
  ReasoningResponse,
  ReasoningTrigger,
} from "@/components/prompt-kit/reasoning";

// Define types for the reasoning component
interface ReasoningTextDetail {
  type: "text";
  text: string;
  signature?: string;
}

interface ReasoningRedactedDetail {
  type: "redacted";
  data: string;
}

// Union type for all possible detail types
type ReasoningDetailType = ReasoningTextDetail | ReasoningRedactedDetail;

interface ReasoningPart {
  type: string;
  details: ReasoningDetailType[];
}

// Define the prop type using the actual message structure
interface AIReasoningProps {
  reasoningParts: ReasoningPart[];
}

export const AIReasoning: React.FC<AIReasoningProps> = ({ reasoningParts }) => {
  // Extract text from reasoning parts, safely handling both detail types
  const reasoningText = reasoningParts
    .flatMap((part) =>
      part.details
        .filter(
          (detail): detail is ReasoningTextDetail => detail.type === "text"
        )
        .map((detail) => detail.text)
    )
    .join("\n");

  return (
    <Reasoning>
      <div className="flex w-full flex-col gap-3">
        <ReasoningTrigger>Show reasoning</ReasoningTrigger>
        <ReasoningContent className="ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700">
          <ReasoningResponse text={reasoningText} />
        </ReasoningContent>
      </div>
    </Reasoning>
  );
};
