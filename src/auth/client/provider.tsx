"use client";

import { createAuthClient, type BetterFetchError } from "better-auth/react";
import { createContext, ReactNode } from "react";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gemish.vercel.app";

const authClient = createAuthClient({
  baseURL: BASE_URL,
});

const { signIn, signOut, signUp, useSession } = authClient;

// Export inferred types
export type Session = typeof authClient.$Infer.Session;

interface AuthContextType {
  signIn: typeof signIn;
  signOut: typeof signOut;
  signUp: typeof signUp;
  session: Session | null;
  isPending: boolean;
  error: BetterFetchError | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = useSession();

  const value = {
    signIn,
    signOut,
    signUp,
    isPending,
    error,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
