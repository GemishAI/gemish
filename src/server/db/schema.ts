import type { Attachment, JSONValue } from "ai";
import {
  boolean,
  index,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { IdGenerator } from "@/config/id-generator";

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
    args: any;
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
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").default("New Chat"),
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
    id: text("id").primaryKey().notNull(),
    role: text("role", {
      enum: ["system", "user", "assistant", "data"],
    }).notNull(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    content: text("content"),
    annotations: json("annotations").$type<Array<JSONValue>>().notNull(), // Explicitly typed as array of any
    parts: json("parts")
      .notNull()
      .$type<
        Array<
          TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart
        >
      >(), // Union type for parts
    experimental_attachments: json("experimental_attachments").$type<
      Array<Attachment>
    >(), // Typed attachments
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      chatIdIdx: index("message_chatId_idx").on(table.chatId),
    };
  }
);

export const checkout = pgTable(
  "checkouts",
  {
    id: text("id").primaryKey().notNull(), // Checkout session ID from Polar
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // Links to the user
    status: text("status").notNull(),
    totalAmount: text("total_amount").notNull(), // Store as string to avoid floating-point issues
    currency: varchar("currency", { length: 10 }).notNull(),
    metadata: json("metadata"), // Store any additional data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("checkout_user_idx").on(table.userId),
  })
);

export const subscription = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey().notNull(), // Subscription ID from Polar
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // Links to the user
    status: text("status", {
      enum: ["active", "canceled", "revoked", "expired", "trialing"],
    }).notNull(),
    planId: text("plan_id").notNull(), // Reference to the plan
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    canceledAt: timestamp("canceled_at"),
    metadata: json("metadata"), // Store extra details like invoice details
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("subscription_user_idx").on(table.userId),
  })
);
