"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { GithubIcon, Loader2, Mail } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const providers = ["github", "google"] as const;
type Provider = (typeof providers)[number];

export default function Login() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const session = useSession();

  if (session.data?.user) {
    return router.push("/");
  }

  async function handleSocialLogin(provider: Provider) {
    setLoadingProvider(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Authentication failed. Please try again later.");
      setLoadingProvider(null);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            {/* You can replace this with your actual logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome to Gemish
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Sign in to access your personal AI assistant and unlock intelligent
            conversations.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            onClick={() => handleSocialLogin("github")}
            className="w-full h-12 transition-all hover:translate-y-[-2px]"
            variant="outline"
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "github" ? (
              <Loader2 size={18} className="animate-spin mr-3" />
            ) : (
              <GithubIcon className="mr-3" size={18} />
            )}
            Continue with GitHub
          </Button>

          <Button
            onClick={() => handleSocialLogin("google")}
            className="w-full h-12 transition-all hover:translate-y-[-2px]"
            variant="outline"
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <Loader2 size={18} className="animate-spin mr-3" />
            ) : (
              <div className="mr-3">
                <svg
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
            )}
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
