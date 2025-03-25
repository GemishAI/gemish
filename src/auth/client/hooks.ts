import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./provider";
import { AUTH_ROUTES } from "../constants";

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Extend the context with additional authentication utilities
  return {
    ...context,

    /**
     * Protect a route by redirecting unauthenticated users
     * @param redirectTo - Route to redirect to if not authenticated (defaults to login page)
     * @returns Authentication status and loading state
     */
    protect(redirectTo: string = AUTH_ROUTES.SIGN_IN) {
      const router = useRouter();

      useEffect(() => {
        if (!this.isPending && !this.session) {
          router.push(redirectTo);
        }
      }, [this.session, this.isPending, router, redirectTo]);

      return {
        isAuthenticated: !!this.session,
        isLoading: this.isPending,
        session: this.session,
      };
    },

    /**
     * Redirect authenticated users away from certain routes (like login page)
     * @param redirectTo - Route to redirect to if authenticated (defaults to dashboard)
     */
    redirectAuthenticated(redirectTo: string = AUTH_ROUTES.DASHBOARD) {
      const router = useRouter();

      useEffect(() => {
        if (this.session && !this.isPending) {
          router.push(redirectTo);
        }
      }, [this.session, this.isPending, router, redirectTo]);
    },
  };
}
