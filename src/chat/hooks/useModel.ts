import { useCallback, useState } from "react";
import { ModelState } from "../types/chat-types";

/**
 * Hook for managing the model state in the chat provider
 */
export function useModel() {
  // Model state management
  const [model, setModelState] = useState<ModelState>("normal");
  const isSearchActive = model === "search";
  const isThinkActive = model === "think";

  // Toggle functions for model states
  const toggleSearch = useCallback(() => {
    setModelState((prev) => (prev === "search" ? "normal" : "search"));
  }, []);

  const toggleThink = useCallback(() => {
    setModelState((prev) => (prev === "think" ? "normal" : "think"));
  }, []);

  return {
    model,
    setModelState,
    toggleSearch,
    toggleThink,
    isSearchActive,
    isThinkActive,
  };
}
