import { Checkout } from "@polar-sh/nextjs";
import { env } from "@/env.mjs";

export const GET = Checkout({
  accessToken: env.POLAR_ACCESS_TOKEN,
  successUrl: "/confirmation",
  server: env.POLAR_SERVER,
});
