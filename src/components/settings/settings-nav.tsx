"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { searchParams } from "@/config/search-params";
import { cn } from "@/lib/utils";

type NavOption = "account" | "billing";

interface NavItemProps {
  value: NavOption;
  currentNav: string | null;
  onChange: (value: NavOption) => void;
  label: string;
}

export function SettingsNav() {
  const [nav, setNav] = useQueryState("nav", searchParams.nav);

  // Memoize the change handler to maintain referential stability
  const handleNavChange = React.useCallback(
    (value: NavOption) => {
      setNav(value);
    },
    [setNav]
  );

  // Extract NavItem as a memoized component for better reusability
  const NavItem = React.memo(
    ({ value, currentNav, onChange, label }: NavItemProps) => {
      const isActive = currentNav === value;

      return (
        <button
          onClick={() => onChange(value)}
          className={cn(
            "relative pb-2 text-sm font-medium transition-colors",
            isActive
              ? "text-foreground dark:text-foreground"
              : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
          )}
        >
          <span>{label}</span>
          {isActive && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary" />
          )}
        </button>
      );
    }
  );

  // Add display name for better debugging
  NavItem.displayName = "NavItem";

  // Define navigation options using useMemo to prevent unnecessary recreations
  const navOptions = React.useMemo(
    () => [
      { value: "account" as const, label: "Account" },
      { value: "billing" as const, label: "Billing" },
    ],
    []
  );

  return (
    <nav className="flex gap-6 border-b border-border pb-1 dark:border-border">
      {navOptions.map((option) => (
        <NavItem
          key={option.value}
          value={option.value}
          currentNav={nav}
          onChange={handleNavChange}
          label={option.label}
        />
      ))}
    </nav>
  );
}
