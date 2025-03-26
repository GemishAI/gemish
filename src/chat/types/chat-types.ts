import type { Message } from "ai";
import { DebouncedState } from "use-debounce";

export interface ChatContextType {
  // Chat state
  chats: Record<string, Message[]>;
  activeChat: string | null;
  pendingMessages: Record<string, Message>;

  // Chat actions
  createChat: (initialMessage: string) => Promise<void> | undefined;
  setActiveChat: (chatId: string | null) => void;

  // AI chat interface (exposed from useAIChat)
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: DebouncedState<(event?: React.FormEvent) => Promise<void>>;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  reload: () => void;
  isChatLoading: boolean;
  error: Error | undefined;

  // Model state
  model: ModelState;

  setModelState: (model: ModelState) => void;

  toggleSearch: () => void;

  toggleThink: () => void;

  isSearchActive: boolean;

  isThinkActive: boolean;
}

export type ModelState = "normal" | "search" | "think";
