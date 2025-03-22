import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_REPLICA: z.string().url(),

    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),

    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),

    BETTER_AUTH_APP_NAME: z.string().min(1),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string().min(1),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_COOKIE_PREFIX: z.string().min(1),
    BETTER_AUTH_REDIS_PREFIX: z.string().min(1),

    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_ENDPOINT_URL: z.string().url(),
    AWS_REGION: z.string().min(1),
    AWS_S3_BUCKET_NAME: z.string().min(1),

    CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().min(1),

    UNKEY_ROOT_KEY: z.string().min(1),
    UNKEY_API_ID: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_GEMISH_API_KEY: z.string().min(1),

    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_REPLICA: process.env.DATABASE_URL_REPLICA,

    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,

    CLOUDFLARE_TURNSTILE_SECRET_KEY:
      process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,

    NEXT_PUBLIC_GEMISH_API_KEY: process.env.NEXT_PUBLIC_GEMISH_API_KEY,
    UNKEY_ROOT_KEY: process.env.UNKEY_ROOT_KEY,
    UNKEY_API_ID: process.env.UNKEY_API_ID,

    BETTER_AUTH_APP_NAME: process.env.BETTER_AUTH_APP_NAME,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET:
      process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    BETTER_AUTH_REDIS_PREFIX: process.env.BETTER_AUTH_REDIS_PREFIX,
    BETTER_AUTH_COOKIE_PREFIX: process.env.BETTER_AUTH_COOKIE_PREFIX,
    BETTER_AUTH_REDIS_PREFIX: process.env.BETTER_AUTH_REDIS_PREFIX,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,

    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
});
