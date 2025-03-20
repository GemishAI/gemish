import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { google } from "@ai-sdk/google";
import { cacheMiddleware } from "./cache-middleware";

const reasoningModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: [
    extractReasoningMiddleware({
      tagName: "reasoning",
      separator: "\n",
    }),
    cacheMiddleware,
  ],
});

const searchModel = wrapLanguageModel({
  model: google("gemini-2.0-pro-exp-02-05", { useSearchGrounding: true }),
  middleware: cacheMiddleware,
});

const defaultModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-001"),
  middleware: cacheMiddleware,
});

const fastModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-lite-preview-02-05"),
  middleware: cacheMiddleware,
});

export const gemish = customProvider({
  languageModels: {
    fast: fastModel,
    normal: defaultModel,
    think: reasoningModel,
    search: searchModel,
    image: google("gemini-2.0-flash-001"),
  },
});
