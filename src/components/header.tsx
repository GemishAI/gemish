"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatsSheet } from "@/components/chats-sheet";
import { signOut, useSession } from "@/lib/auth-client";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center">
      <div className="md:fixed z-50 flex justify-between items-center top-0 px-6 py-2 w-full bg-background backdrop-filter backdrop-blur-sm bg-opacity-30">
        <Link
          href="/"
          prefetch={true}
          className="text-lg font-medium font-syne"
        >
          Gemish
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-4">
              <ChatsSheet />
              <Button
                onClick={() => signOut()}
                className="rounded-full"
                size={"sm"}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button size={"sm"} className="rounded-full" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
