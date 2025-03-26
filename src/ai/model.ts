import { google } from "@ai-sdk/google";
import { customProvider, wrapLanguageModel } from "ai";
import { cacheMiddleware } from "./cache-middleware";

const searchModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-001", { useSearchGrounding: true }),
  middleware: cacheMiddleware,
});

const defaultModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-001"),
  middleware: cacheMiddleware,
});

const reasoningModel = wrapLanguageModel({
  model: google("gemini-2.5-pro-exp-03-25"),
  middleware: cacheMiddleware,
});

export const gemish = customProvider({
  languageModels: {
    fast: google("gemini-2.0-flash-lite-preview-02-05"),
    normal: defaultModel,
    search: searchModel,
    image: google("gemini-2.0-flash-exp"),
    reasoning: reasoningModel,
  },
});
