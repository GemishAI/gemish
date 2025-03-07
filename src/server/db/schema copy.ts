import type { Attachment, JSONValue } from "ai";
import {
  boolean,
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

type TextUIPart = {
  type: "text";
  text: string;
};

type ReasoningUIPart = {
  type: "reasoning";
  reasoning: string;
};

type ToolInvocationUIPart = {
  type: "tool-invocation";
  toolInvocation: {
    state: "partial-call" | "call" | "result";
    toolCallId: string;
    toolName: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    args: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    result?: any;
  };
};

type SourceUIPart = {
  type: "source";
  source: {
    sourceType: "url";
    id: string;
    url: string;
    title?: string;
  };
};

type MessagePart =
  | TextUIPart
  | ReasoningUIPart
  | ToolInvocationUIPart
  | SourceUIPart;

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
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

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const chat = pgTable(
  "chat",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).default("New Chat"),
    messages: json("messages").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("chats_userId_idx").on(table.userId),
    };
  }
);
const roleEnum = pgEnum("role", ["system", "user", "assistant", "data"]);

export const message = pgTable("message", {
  id: text("id").primaryKey().notNull(),
  role: roleEnum("role").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatId: text("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  content: text("content").notNull(),
  annotations: json("annotations").$type<Array<JSONValue>>().notNull(), // Explicitly typed as array of any
  parts: json("parts")
    .notNull()
    .$type<
      Array<TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart>
    >(), // Union type for parts
  experimentalAttachments: json("experimental_attachments").$type<
    Array<Attachment>
  >(), // Typed attachments
});
