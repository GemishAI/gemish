import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "../constants";
import { auth } from "./auth";

/**
 * Get the current session server-side
 * Use this in Server Components or Route Handlers
 */
export async function getServerSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

/**
 * Check if the current user is authenticated server-side
 * Use this in Server Components or Route Handlers
 */
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}

/**
 * Get the current user server-side
 * Use this in Server Components or Route Handlers
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Protect a route server-side
 * Use this in Server Components
 */
export async function protectRoute(redirectTo: string = AUTH_ROUTES.SIGN_IN) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect(redirectTo);
  }
}
