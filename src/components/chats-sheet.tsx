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
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Chat } from "@/server/db/schema";
import { LoaderSpinner } from "@/components/loader-spinner";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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
import { useRouter } from "next/navigation";

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

export function ChatsSheet() {
  const pathname = usePathname();
  const { data, error, isLoading, mutate } = useSWR("/api/chats", fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const chats: Chat[] = data || [];
  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const organizedChats = organizeChatsByDate(filteredChats, pathname);

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="rounded-full" variant="ghost">
          <HistoryIcon className="w-4 h-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[440px] sm:w-[540px] lg:w-[700px] p-0 flex flex-col"
      >
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex flex-row items-center  ml-3 mb-2">
            <SheetTrigger asChild>
              <button className="rounded-full py-2 px-2 bg-background hover:bg-muted transition-all duration-200 h-fit w-fit">
                <XIcon className="size-5" />
              </button>
            </SheetTrigger>

            <SheetHeader className="mt-2">
              <SheetTitle className="text-xl font-medium">
                Chat History
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="px-3 pb-2 mb-5">
            <Input
              placeholder="Search chats..."
              className="bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading || isRetrying ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <div className="flex items-center justify-center">
                  <LoaderSpinner width="24" height="24" />
                </div>
              </div>
              <h1 className="text-lg font-medium">Loading chats</h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your conversations
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircleIcon className="w-6 h-6 text-destructive" />
              </div>
              <h1 className="text-lg font-medium">Failed to load chats</h1>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading your conversations
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
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            </div>
          ) : Object.keys(organizedChats).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              {searchQuery ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 mx-auto">
                    <SearchIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h1 className="text-lg font-medium">No matches found</h1>
                  <p className="text-sm text-muted-foreground">
                    No chats match your search for "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 mx-auto">
                    <MessageSquareIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h1 className="text-lg font-medium">No chats yet</h1>
                  <p className="text-sm text-muted-foreground">
                    Start a new chat to begin your conversation
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="px-2 py-2 space-y-6">
                {Object.entries(organizedChats)
                  .sort(
                    ([a], [b]) => getCategoryWeight(a) - getCategoryWeight(b)
                  )
                  .map(([category, categoryChats]) => (
                    <div key={category} className="space-y-2">
                      <h2 className="text-sm font-medium text-muted-foreground px-3 mb-2">
                        {category}
                      </h2>
                      <div className="space-y-1">
                        {categoryChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={cn(
                              "flex items-center px-3 py-2 w-full rounded-md text-sm transition-colors group cursor-pointer",
                              "hover:bg-accent hover:text-accent-foreground",
                              "relative",
                              chat.active &&
                                "bg-accent/50 text-accent-foreground font-medium"
                            )}
                          >
                            <Link
                              href={`/chat/${chat.id}`}
                              onClick={(e) => {
                                if (e.target !== e.currentTarget) {
                                  e.preventDefault();
                                }
                                console.log(chat.id);
                              }}
                              className="flex-1 min-w-0"
                            >
                              <div className="flex items-center w-full gap-3 min-w-0">
                                <span className="truncate flex-1">
                                  {chat.title || "New Chat"}
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
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[160px]"
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
                                  <span>Rename</span>
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
                                  <span className="text-destructive">
                                    Delete
                                  </span>
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
      </SheetContent>

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
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Give your chat a meaningful title to help you find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="relative">
              <Textarea
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value.slice(0, 100))}
                placeholder="Enter chat title"
                className="resize-none pr-16"
                rows={3}
                autoFocus
              />
              <div className="absolute right-3 top-3 text-xs text-muted-foreground">
                {newTitle.length}/100
              </div>
            </div>
            {newTitle.length === 100 && (
              <p className="text-xs text-destructive">
                Title cannot be longer than 100 characters
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
              {isRenaming ? "Renaming..." : "Save"}
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
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
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
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
