"use client";

import { createAuthClient } from "better-auth/react";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gemish.vercel.app";

const authClient = createAuthClient({
  baseURL: BASE_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
