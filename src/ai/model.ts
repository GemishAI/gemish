import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  simulateStreamingMiddleware,
} from "ai";
import { google } from "@ai-sdk/google";
import { cacheMiddleware } from "./cache-middleware";

const reasoningModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: [
    extractReasoningMiddleware({ tagName: "think" }),
    cacheMiddleware,
  ],
});

const searchModel = wrapLanguageModel({
  model: google("gemini-2.0-pro-exp-02-05", { useSearchGrounding: true }),
  middleware: simulateStreamingMiddleware(),
});

const defaultModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-001"),
  middleware: cacheMiddleware,
});

export const gemish = customProvider({
  languageModels: {
    fast: google("gemini-2.0-flash-lite-preview-02-05"),
    normal: defaultModel,
    think: reasoningModel,
    search: google("gemini-2.0-flash-001", { useSearchGrounding: true }),
  },
});
