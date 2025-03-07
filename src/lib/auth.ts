import { redis } from "@/lib/redis";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env.mjs";
import { db } from "@/server/db";

const auth_prefix = "gemish:auth";
export const cookiePrefix = "gemish-auth-session";

const baseURL =
	process.env.NODE_ENV === "development"
		? "http://localhost:3000"
		: "https://gemish.vercel.app";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
	appName: "Gemish",
	baseURL,

	advanced: {
		cookiePrefix,
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
				typeof value === "object" && value !== null
					? JSON.stringify(value)
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
});
