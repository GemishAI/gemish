import { customProvider } from "ai";
import { google } from "@ai-sdk/google";

export const gemish = customProvider({
  languageModels: {
    fast: google("gemini-2.0-flash-lite-preview-02-05"),
    normal: google("gemini-2.0-flash-001"),
    think: google("gemini-2.0-flash-thinking-exp-01-21"),
    search: google("gemini-2.0-pro-exp-02-05", { useSearchGrounding: true }),
    image: google("gemini-2.0-flash-001"),
  },
});
