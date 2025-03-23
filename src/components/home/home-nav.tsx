import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "../ui/button";

export async function HomeNav() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <header className="w-full h-16 fixed top-0 inset-x-0 z-50">
      <div className="container max-w-6xl mx-auto backdrop-blur-lg">
        <nav className="flex items-center justify-between py-2.5">
          <Link
            href="/"
            className="text-xl font-urbanist font-medium hover:text-primary transition-colors"
          >
            Gemish
          </Link>
          {session ? (
            <Button className="rounded-full " variant={"outline"} asChild>
              <Link href="/chat">Go to Chat</Link>
            </Button>
          ) : (
            <Button className="rounded-full " asChild>
              <Link href="/login" className="dark:text-white">
                Sign In
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
