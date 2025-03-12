"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme, e) => {
    e.preventDefault();
    e.stopPropagation();
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center border p-0.5 rounded-full bg-background w-fit">
      <button
        onClick={(e) => handleThemeChange("light", e)}
        className={`p-1 rounded-full cursor-pointer transition-all duration-300 ease-out ${
          theme === "light" ? "border-primary/30 border" : ""
        }`}
        aria-label="Light mode"
      >
        <Sun
          className={`size-3 transition-colors duration-200 ${
            theme === "light"
              ? "text-yellow-600"
              : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        />
      </button>

      <button
        onClick={(e) => handleThemeChange("dark", e)}
        className={`p-1 rounded-full cursor-pointer transition-all duration-300 ease-out ${
          theme === "dark" ? "bg-primary/10" : ""
        }`}
        aria-label="Dark mode"
      >
        <Moon
          className={`size-3 transition-colors duration-200 ${
            theme === "dark"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        />
      </button>

      <button
        onClick={(e) => handleThemeChange("system", e)}
        className={`p-1 rounded-full cursor-pointer transition-all duration-300 ease-out ${
          theme === "system" ? "border-primary/10 border" : ""
        }`}
        aria-label="System mode"
      >
        <Monitor
          className={`size-3 transition-colors duration-200 ${
            theme === "system"
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        />
      </button>
    </div>
  );
}
