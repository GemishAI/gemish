import { IdGenerator } from "@/config/id-generator";
import type { Message } from "ai";
import {
  boolean,
  index,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const user = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => IdGenerator("user"))
      .notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => {
    return {
      emailIdx: index("user_email_idx").on(table.email),
    };
  }
);

export const account = pgTable(
  "account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => IdGenerator("acc"))
      .notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("account_userId_idx").on(table.userId),
  })
);

export const verification = pgTable(
  "verification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => IdGenerator("ver"))
      .notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => {
    return {
      identifierIdx: index("verification_identifier_idx").on(table.identifier),
    };
  }
);

export const chat = pgTable(
  "chat",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => IdGenerator("chat")),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").default("(New Chat)"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("chats_userId_idx").on(table.userId),
    };
  }
);

const chatSchema = createSelectSchema(chat);
export type Chat = z.infer<typeof chatSchema>;

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    role: text("role").$type<Message["role"]>().notNull(),
    content: text("content").$type<Message["content"]>(),
    annotations: json("annotations")
      .$type<Message["annotations"]>()
      .default([])
      .notNull(),
    parts: json("parts").$type<Message["parts"]>().default([]).notNull(),
    experimental_attachments: json("experimental_attachments")
      .$type<Message["experimental_attachments"]>()
      .default([]),
    createdAt: timestamp("created_at", { mode: "date" })
      .$type<Message["createdAt"]>()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      chatIdIdx: index("message_chatId_idx").on(table.chatId),
    };
  }
);
