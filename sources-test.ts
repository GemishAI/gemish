import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function TestReasoning() {
  const { text, reasoning, reasoningDetails } = await generateText({
    model: google("gemini-2.0-flash-thinking-exp-01-21"),
    prompt: "Explain how RLHF works in simple terms.",
  });

  console.log("text", text);
  console.log("reasoning", reasoning);
  console.log("reasoningDetails", reasoningDetails);
}

TestReasoning();
