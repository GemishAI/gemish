"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

type ThemeOption = "light" | "dark" | "system";

interface ThemeButtonProps {
  themeValue: ThemeOption;
  currentTheme: string | undefined;
  onClick: (theme: ThemeOption, e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Memoize the event handler to prevent recreation on each render
  const handleThemeChange = React.useCallback(
    (newTheme: ThemeOption, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setTheme(newTheme);
    },
    [setTheme]
  );

  // Extract ThemeButton as a memoized component to improve readability and performance
  const ThemeButton = React.memo(
    ({ themeValue, currentTheme, onClick, icon, label }: ThemeButtonProps) => {
      // Determine button styling based on whether it's the active theme
      const isActive = currentTheme === themeValue;

      // Different themes have different active styles
      const getActiveStyles = () => {
        switch (themeValue) {
          case "light":
            return isActive ? "border-primary/30 border" : "";
          case "dark":
            return isActive ? "bg-primary/10" : "";
          case "system":
            return isActive ? "border-primary/10 border" : "";
          default:
            return "";
        }
      };

      // Determine icon color based on active state and theme
      const getIconColorClass = () => {
        if (isActive) {
          switch (themeValue) {
            case "light":
              return "text-yellow-600";
            case "dark":
              return "text-blue-600 dark:text-blue-400";
            case "system":
              return "text-green-600 dark:text-green-400";
            default:
              return "";
          }
        }

        return "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";
      };

      return (
        <button
          onClick={(e) => onClick(themeValue, e)}
          className={`p-1 rounded-full cursor-pointer transition-all duration-300 ease-out ${getActiveStyles()}`}
          aria-label={label}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: `size-3 transition-colors duration-200 ${getIconColorClass()}`,
          })}
        </button>
      );
    }
  );

  // Improve component naming for better debugging
  ThemeButton.displayName = "ThemeButton";

  // Define theme options configuration for cleaner rendering
  const themeOptions = React.useMemo(
    () => [
      { value: "light" as const, icon: <Sun />, label: "Light mode" },
      { value: "dark" as const, icon: <Moon />, label: "Dark mode" },
      { value: "system" as const, icon: <Monitor />, label: "System mode" },
    ],
    []
  );

  return (
    <div className="flex items-center border p-0.5 rounded-full bg-background w-fit">
      {themeOptions.map((option) => (
        <ThemeButton
          key={option.value}
          themeValue={option.value}
          currentTheme={theme}
          onClick={handleThemeChange}
          icon={option.icon}
          label={option.label}
        />
      ))}
    </div>
  );
}
