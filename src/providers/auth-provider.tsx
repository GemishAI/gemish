"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { createAuthClient, type BetterFetchError } from "better-auth/react";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gemish.vercel.app";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, signUp, useSession } = authClient;

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
