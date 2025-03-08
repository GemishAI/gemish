import { auth } from "@/lib/auth";
import { loadChat, saveChat } from "@/server/db/chat-store";
import { google } from "@ai-sdk/google";
import {
  type Message,
  appendClientMessage,
  appendResponseMessages,
  smoothStream,
  streamText,
} from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, id }: { message: Message; id: string } = await req.json();

  console.log(message, id, "Message and ID");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const previousMessages = await loadChat({ id, userId: session.user.id });

    const messages = appendClientMessage({
      messages: previousMessages.messages as Message[],
      message,
    });

    const result = streamText({
      model: google("gemini-2.0-flash-001"),
      messages,
      system:
        "You are a helpful assistant. Respond to the user in Markdown format.",
      experimental_transform: smoothStream(),

      async onFinish({ response }) {
        const updatedMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages,
        });

        console.log(`Saving ${updatedMessages.length} messages for chat ${id}`);

        await saveChat({
          id,
          userId: session.user.id,
          messages: updatedMessages,
        });
      },
    });

    result.consumeStream();

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in AI API route:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
