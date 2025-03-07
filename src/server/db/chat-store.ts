import { google } from "@ai-sdk/google";
import { type Message, generateId, generateText } from "ai";
import { eq } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";
import { db } from "./index";
import { chat } from "./schema";

export async function loadChat(id: string) {
	const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));

	if (!selectedChat) {
		throw new Error(`Chat with ID ${id} not found`);
	}

	// Parse messages if they're stored as a string
	if (selectedChat.messages && typeof selectedChat.messages === "string") {
		try {
			selectedChat.messages = JSON.parse(selectedChat.messages);
		} catch (e) {
			console.error("Error parsing messages JSON:", e);
			selectedChat.messages = [];
		}
	}

	return selectedChat;
}

export async function saveChat({
	id,
	messages,
	userId,
}: {
	id: string;
	messages: Message[];
	userId: string;
}) {
	try {
		console.log(`Saving chat ${id} with ${messages.length} messages`);

		// Generate a title for the chat based on the conversation
		let title = "New Chat";
		if (messages.length > 0) {
			try {
				const { text } = await generateText({
					model: google("gemini-1.5-flash"),
					messages: [
						{
							role: "system",
							content:
								"Create a concise title (max 5 words) summarizing this conversation.",
						},
						{ role: "user", content: messages[0].content },
					],
				});
				title = text || title;
			} catch (error) {
				console.error("Error generating title:", error);
			}
		}

		// Check if chat exists
		const existingChat = await db.query.chat.findFirst({
			where: eq(chat.id, id),
		});

		// Ensure messages are properly serialized
		const serializedMessages = JSON.stringify(messages);

		if (existingChat) {
			// Update existing chat
			console.log(`Updating existing chat ${id}`);
			await db
				.update(chat)
				.set({
					messages: serializedMessages,
					updatedAt: new Date(),
					// Only update title if this is a new chat with first message
					...(existingChat.title === "New Chat" && messages.length > 0
						? { title }
						: {}),
				})
				.where(eq(chat.id, id));
		} else {
			// Create new chat
			console.log(`Creating new chat ${id}`);
			await db.insert(chat).values({
				id,
				title,
				userId,
				messages: serializedMessages,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		return { success: true };
	} catch (error) {
		console.error(`Error saving chat ${id}:`, error);
		throw error;
	}
}

export async function getChatHistory() {
	const chats = cache(
		async () => {
			return await db.query.chat.findMany();
		},
		["chats"],
		{ revalidate: 3600, tags: ["chats"] },
	);

	const data = await chats();
	return data;
}
