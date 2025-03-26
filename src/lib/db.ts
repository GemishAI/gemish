import Dexie, { type Table } from "dexie";

export interface ChatInput {
  id: string;
  userId: string;
  chatId: string;
  content: string;
  updatedAt: Date;
}

export class ChatDB extends Dexie {
  chatInputs!: Table<ChatInput>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      chatInputs: "id, userId, chatId, updatedAt",
    });
  }
}

export const db = new ChatDB();
