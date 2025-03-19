import { redis } from "@/lib/redis";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env.mjs";
import { db } from "@/server/db";
import { polarClient } from "./polar";
import { polar } from "@polar-sh/better-auth";

const auth_prefix = env.BETTER_AUTH_REDIS_PREFIX;

const baseURL =
  process.env.NODE_ENV === "development" ?
    "http://localhost:3000"
  : "https://gemish.vercel.app";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: env.BETTER_AUTH_APP_NAME,
  baseURL,

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
      const serializedValue =
        typeof value === "object" && value !== null ?
          JSON.stringify(value)
        : String(value);

      if (ttl) {
        await redis.set(`${auth_prefix}:${key}`, serializedValue, { ex: ttl });
      } else {
        await redis.set(`${auth_prefix}:${key}`, serializedValue);
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
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID as string,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET as string,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      checkout: {
        enabled: true,
        products: [
          {
            productId: "92fe154a-84c2-4e7d-b4e4-c0b39a418c06",
            slug: "free",
          },
        ],
        successUrl: "/success?checkout_id={CHECKOUT_ID}",
      },
      webhooks: {
        secret: env.POLAR_WEBHOOK_SECRET,
      },
    }),
  ],
});
