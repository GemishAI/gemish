import { auth } from "@/lib/auth";
import { loadChat, saveChat } from "@/server/db/chat-store";
import { google } from "@ai-sdk/google";
import {
  type CoreMessage,
  type Message,
  type UIMessage,
  appendClientMessage,
  appendResponseMessages,
  smoothStream,
  streamText,
} from "ai";
import { convertToCoreMessages } from "ai";
import { createIdGenerator } from "ai";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { message, id, allMessages }: { message: Message; id: string; allMessages?: Message[] } = await req.json();
    
    console.log("API received:", { messageId: message?.id, chatId: id, hasAllMessages: !!allMessages });

    let previousMessages = [] as Message[];
    let isNewChat = false;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect("/login");
    }

    try {
      const chatData = await loadChat(id);
      previousMessages = chatData.messages as Message[];
      console.log(`Loaded ${previousMessages.length} previous messages for chat ${id}`);
    } catch (error) {
      // If chat doesn't exist yet, we'll mark it as a new chat
      console.log("Chat not found, starting new chat with ID:", id);
      isNewChat = true;
      // We'll continue with an empty array of previous messages
    }

    // If client sent all messages, use those instead of loading from DB
    // This helps in cases where the client has optimistic updates not yet saved
    const baseMessages = allMessages || previousMessages;
    
    // Append the new message if provided
    const messages = message
      ? appendClientMessage({
          messages: baseMessages,
          message,
        })
      : baseMessages;

    console.log(`Processing ${messages.length} messages for chat ${id}`);

    const result = streamText({
      model: google("gemini-2.0-pro-exp-02-05"),
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
        
        revalidateTag(`chat-${id}`);
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
