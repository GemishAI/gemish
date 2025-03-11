import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { appendClientMessage, appendResponseMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { saveChat } from "@/server/db/chat-store";
import {
  loadChatMessages,
  validateChatOwnership,
} from "@/server/db/message-loader";
import { type Message, smoothStream } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  // Get only the last message from the client
  const { message, id }: { message: Message; id: string } = await req.json();

  if (!message || !id) {
    return NextResponse.json(
      { error: "Message and chat ID are required" },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      messages: previousMessages[0].content === "" ? [] : previousMessages,
      message,
    });

    const result = streamText({
      model: google("gemini-2.0-flash-001"),
      messages,
      system:
        "You are a helpful assistant. Respond to the user in Markdown format.",
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "word",
      }),
      async onFinish({ response }) {
        await saveChat({
          id,
          userId: session.user.id,
          messages: appendResponseMessages({
            messages: messages,
            responseMessages: response.messages,
          }),
        });
      },
    });

    // consume the stream to ensure it runs to completion & triggers onFinish
    // even when the client response is aborted:
    result.consumeStream(); // no await
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in AI API route:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
