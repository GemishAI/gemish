import { gemish } from "@/ai/model";
import { auth } from "@/auth/server";
import {
  CONVERSATIONAL_AI_PROMPT,
  FILE_ANALYSIS_AI_PROMPT,
  WEB_SEARCH_SYSTEM_PROMPT,
} from "@/config/system-prompts";
import {
  invalidateChatMessagesCache,
  invalidateUserChatListCache,
} from "@/lib/redis";
import { saveChat } from "@/server/db/chat-store";
import {
  loadChatMessages,
  validateChatOwnership,
} from "@/server/db/message-loader";
import {
  appendClientMessage,
  appendResponseMessages,
  createIdGenerator,
  type Message,
  smoothStream,
  streamText,
} from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  // Get only the last message from the client
  const {
    message,
    id,
    model,
  }: { message: Message; id: string; model: string } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!message || !id) {
    return NextResponse.json(
      { error: "Message and chat ID are required" },
      { status: 400 }
    );
  }

  try {
    // Validate the chat belongs to this user
    const isValidChat = await validateChatOwnership(id, session.user.id);

    if (!isValidChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Load previous messages from the database
    const previousMessages = await loadChatMessages(id);

    const messages = appendClientMessage({
      messages: !previousMessages ? [] : previousMessages,
      message,
    });

    // Check if any message has attachments
    const messagesHaveAttachments = messages.some(
      (msg) =>
        msg?.experimental_attachments && msg.experimental_attachments.length > 0
    );

    // Select the appropriate system prompt based on model and attachments
    let systemPrompt = CONVERSATIONAL_AI_PROMPT; // Default to conversational

    if (model === "search") {
      systemPrompt = WEB_SEARCH_SYSTEM_PROMPT;
    } else if (messagesHaveAttachments) {
      systemPrompt = FILE_ANALYSIS_AI_PROMPT;
    }

    // Select the appropriate model based on attachments
    const selectedModel = messagesHaveAttachments
      ? gemish.languageModel("image")
      : gemish.languageModel(model);

    const result = streamText({
      model: selectedModel,
      messages,
      system: systemPrompt,
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "word",
      }),
      experimental_generateMessageId: createIdGenerator({
        prefix: "msgs",
        separator: "_",
      }),
      async onFinish({ response }) {
        try {
          const messagesToSave = appendResponseMessages({
            messages: messages,
            responseMessages: response.messages,
          });

          console.log(
            JSON.stringify(messagesToSave, null, 2),
            "messagesToSave"
          );
          await saveChat({
            id,
            userId: session.user.id,
            messages: messagesToSave,
          });

          // Only invalidate caches if save was successful
          await Promise.all([
            invalidateChatMessagesCache(session.user.id, id),
            invalidateUserChatListCache(session.user.id),
          ]);
        } catch (error) {
          console.error("Error saving chat messages:", error);
          // Don't throw here - we want to complete the stream even if saving fails
        }
      },
    });

    // consume the stream to ensure it runs to completion & triggers onFinish
    // even when the client response is aborted:
    result.consumeStream(); // no await
    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    });
  } catch (error) {
    console.error("Error in AI API route:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
