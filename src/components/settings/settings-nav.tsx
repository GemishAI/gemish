"use client";

import { useQueryState } from "nuqs";
import { searchParams } from "@/config/search-params";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const [nav, setNav] = useQueryState("nav", searchParams.nav);

  return (
    <nav className="flex gap-6 border-b border-border pb-1 dark:border-border">
      <button
        onClick={() => setNav("account")}
        className={cn(
          "relative pb-2 text-sm font-medium transition-colors",
          nav === "account"
            ? "text-foreground dark:text-foreground"
            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
        )}
      >
        <span>Account</span>
        {nav === "account" && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary" />
        )}
      </button>

      <button
        onClick={() => setNav("billing")}
        className={cn(
          "relative pb-2 text-sm font-medium transition-colors",
          nav === "billing"
            ? "text-foreground dark:text-foreground"
            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
        )}
      >
        <span>Billing</span>
        {nav === "billing" && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary" />
        )}
      </button>
    </nav>
  );
}
