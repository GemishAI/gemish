"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  HistoryIcon,
  SearchIcon,
  RefreshCcw,
  MessageSquareIcon,
  XCircleIcon,
  XIcon,
  Edit,
  Trash,
  EllipsisVerticalIcon,
  PlusCircle,
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Chat } from "@/server/db/schema";
import { LoaderSpinner } from "@/components/loader-spinner";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper function to format dates using date-fns
const formatDate = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM yyyy");
};

// Helper function to get category order weight
const getCategoryWeight = (category: string): number => {
  if (category === "Today") return 1;
  if (category === "Yesterday") return 2;
  return 3;
};

// Type for our categorized chats
type ChatsByDate = {
  [key: string]: Array<Chat & { active: boolean }>;
};

// Helper function to organize chats by date
const organizeChatsByDate = (
  chats: Chat[],
  currentPath?: string
): ChatsByDate => {
  const organizedChats: ChatsByDate = {};

  chats.forEach((chat) => {
    const date = new Date(chat.updatedAt);
    const category = formatDate(date);

    if (!organizedChats[category]) {
      organizedChats[category] = [];
    }

    organizedChats[category].push({
      ...chat,
      active: `/chat/${chat.id}` === currentPath,
    });
  });

  // Sort chats within each category
  Object.keys(organizedChats).forEach((category) => {
    organizedChats[category].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  return organizedChats;
};

export default function RecentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, isLoading, mutate } = useSWR("/api/chats", fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const chats: Chat[] = data || [];
  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const organizedChats = organizeChatsByDate(filteredChats, pathname);

  // Clear search when escape is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await mutate();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRename = async (id: string) => {
    try {
      setIsRenaming(true);
      await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      await mutate();
      setChatToRename(null);
      setNewTitle("");
    } catch (error) {
      console.error("Failed to rename chat:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await fetch(`/api/chats/${id}`, { method: "DELETE" });
      await mutate();
      setChatToDelete(null);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const createNewChat = () => {
    router.push("/chat/new");
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 px-4 md:px-0">
      <div className="flex items-center justify-between pb-6">
        <h1 className="text-2xl font-semibold">Your Conversations</h1>
        <Button onClick={createNewChat} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="border-b p-4">
          <div className="relative">
            <SearchIcon
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-opacity",
                searchFocused || searchQuery ? "opacity-100" : "opacity-70"
              )}
            />
            <Input
              placeholder="Search your conversations..."
              className="pl-10 bg-muted/50 border-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-[400px] max-h-[70vh]">
          {isLoading || isRetrying ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <LoaderSpinner width="24" height="24" />
              </div>
              <h2 className="text-lg font-medium">
                Loading your conversations
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Just a moment while we retrieve your chat history
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircleIcon className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-medium">Something went wrong</h2>
              <p className="text-sm text-muted-foreground my-3">
                We couldn't load your conversations. Please try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="gap-2"
              >
                <RefreshCcw
                  className={cn("w-4 h-4", isRetrying && "animate-spin")}
                />
                {isRetrying ? "Trying again..." : "Try again"}
              </Button>
            </div>
          ) : Object.keys(organizedChats).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              {searchQuery ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 mx-auto">
                    <SearchIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-medium">No matches found</h2>
                  <p className="text-sm text-muted-foreground">
                    We couldn't find any conversations matching "
                    <span className="font-medium">{searchQuery}</span>"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 mx-auto">
                    <MessageSquareIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-medium">
                    Your conversation history is empty
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Start your first conversation to see it appear here
                  </p>
                  <Button
                    onClick={createNewChat}
                    size="sm"
                    className="mt-2 gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Start a new conversation
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="px-2 py-3 space-y-6">
                {Object.entries(organizedChats)
                  .sort(
                    ([a], [b]) => getCategoryWeight(a) - getCategoryWeight(b)
                  )
                  .map(([category, categoryChats]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-xs font-medium uppercase text-muted-foreground px-3 mb-2">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {categoryChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={cn(
                              "flex items-center px-3 py-3 w-full rounded-md text-sm transition-colors group cursor-pointer",
                              "hover:bg-accent hover:text-accent-foreground",
                              "relative",
                              chat.active &&
                                "bg-accent text-accent-foreground font-medium"
                            )}
                          >
                            <Link
                              href={`/chat/${chat.id}`}
                              onClick={(e) => {
                                if (e.target !== e.currentTarget) {
                                  e.preventDefault();
                                }
                              }}
                              className="flex-1 min-w-0"
                            >
                              <div className="flex items-center w-full gap-3 min-w-0">
                                <MessageSquareIcon className="h-4 w-4 shrink-0 opacity-70" />
                                <span className="truncate flex-1">
                                  {chat.title || "Untitled conversation"}
                                </span>
                                {chat.active && (
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                )}
                              </div>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <EllipsisVerticalIcon className="h-4 w-4" />
                                  <span className="sr-only">Chat options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[180px]"
                              >
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setChatToRename(chat.id);
                                    setNewTitle(chat.title || "");
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Rename conversation</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setChatToDelete(chat.id);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                  <span>Delete conversation</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!chatToRename}
        onOpenChange={(open) => {
          if (!open) {
            setChatToRename(null);
            setNewTitle("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>
              Add a descriptive title to help you find this conversation later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="relative">
              <Textarea
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value.slice(0, 100))}
                placeholder="Enter a title for this conversation"
                className="resize-none pr-16"
                rows={3}
                autoFocus
              />
              <div
                className={cn(
                  "absolute right-3 top-3 text-xs",
                  newTitle.length >= 90
                    ? "text-amber-500"
                    : "text-muted-foreground",
                  newTitle.length === 100 && "text-destructive font-medium"
                )}
              >
                {newTitle.length}/100
              </div>
            </div>
            {newTitle.length === 100 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <XCircleIcon className="h-3 w-3" />
                Title cannot exceed 100 characters
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChatToRename(null);
                setNewTitle("");
              }}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={() => chatToRename && handleRename(chatToRename)}
              disabled={!newTitle.trim() || isRenaming}
              className="gap-2"
            >
              {isRenaming && <LoaderSpinner width="16" height="16" />}
              {isRenaming ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!chatToDelete}
        onOpenChange={(open) => !open && setChatToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              This will permanently remove this conversation from your history.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChatToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => chatToDelete && handleDelete(chatToDelete)}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting && <LoaderSpinner width="16" height="16" />}
              {isDeleting ? "Deleting..." : "Delete conversation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
