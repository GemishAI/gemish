import { env } from "@/env.mjs";
import { redis } from "@/lib/redis";
import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gemish.vercel.app";

const auth_prefix = env.BETTER_AUTH_REDIS_PREFIX;

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: env.BETTER_AUTH_APP_NAME,
  baseURL: BASE_URL,

  advanced: {
    cookiePrefix: env.BETTER_AUTH_COOKIE_PREFIX,
    generateId: false,
  },

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  secondaryStorage: {
    // @ts-expect-error - Redis returns a string or null
    get: async (key) => {
      const value = await redis.get(`${auth_prefix}:${key}`);

      if (!value) return null;

      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
      }

      return value;
    },

    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(`${auth_prefix}:${key}`, value, { ex: ttl });
      } else {
        await redis.set(`${auth_prefix}:${key}`, value);
      }
    },

    delete: async (key) => {
      await redis.del(`${auth_prefix}:${key}`);
    },
  },

  rateLimit: {
    storage: "secondary-storage",
  },

  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
