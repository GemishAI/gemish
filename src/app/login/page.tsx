"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { GithubIcon, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const providers = ["github", "google"] as const;
type Provider = (typeof providers)[number];

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  if (session.data?.user) {
    return router.push("/");
  }

  async function handleSocialLogin(provider: Provider) {
    setIsLoading(true);
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Failed to sign in. Please try again later.");
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 max-w-sm mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Login</h1>

        <p className="text-md">Login to Gemish to chat with your Gemish AI.</p>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button
          onClick={() => handleSocialLogin("github")}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <GithubIcon />
          )}
          Login with Github
        </Button>
        <Button
          onClick={() => handleSocialLogin("google")}
          className="w-full"
          variant="outline"
        >
          {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
          Login with Google
        </Button>
      </div>
    </div>
  );
}
