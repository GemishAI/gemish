"use client";

import { createAuthClient, type BetterFetchError } from "better-auth/react";
import { createContext, ReactNode } from "react";
import { BASE_URL } from "../constants";

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

  return <AuthContext value={value}>{children}</AuthContext>;
}
