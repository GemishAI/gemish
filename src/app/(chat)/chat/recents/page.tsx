"use client";

import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  RefreshCcw,
  MessageSquareIcon,
  XCircleIcon,
  XIcon,
  Edit,
  Trash,
  EllipsisVerticalIcon,
  PlusIcon,
} from "lucide-react";
import type { Chat } from "@/server/db/schema";
import { LoaderSpinner } from "@/components/loader-spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import { parseAsString, useQueryState } from "nuqs";
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
import useSWRInfinite from "swr/infinite";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      shallow: false,
    })
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const LIMIT = 20;

  const getKey = useCallback(
    (index: number) => {
      if (index === null) return null;
      return `/api/chats?limit=${LIMIT}&offset=${index * LIMIT}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
    },
    [searchQuery]
  );

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite(getKey, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });

  const hasMore = useMemo(
    () => data?.[data.length - 1]?.pagination?.hasMore || false,
    [data]
  );

  const chats: Chat[] = data ? data.flatMap((page) => page.chats) : [];

  const filteredChats = useMemo(
    () =>
      chats
        .filter((chat) =>
          chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((chat) => ({
          ...chat,
          active: `/chat/${chat.id}` === pathname,
        }))
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [chats, searchQuery, pathname]
  );

  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isValidating, hasMore, size, setSize]);

  useEffect(() => {
    setSize(1);
  }, [searchQuery, setSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await mutate();
    } finally {
      setIsRetrying(false);
    }
  }, [mutate]);

  const handleRename = useCallback(
    async (id: string) => {
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
    },
    [mutate, newTitle]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true);
        await fetch(`/api/chats/${id}`, {
          method: "DELETE",
        });
        await mutate();
        setChatToDelete(null);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      } finally {
        setIsDeleting(false);
      }
    },
    [mutate]
  );

  return (
    <div className="flex h-full flex-col lg:px-4 lg:py-8 pt-20 gap-5  w-full">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-medium">Chats</h1>
        <Button asChild>
          <Link href="/chat">
            <PlusIcon />
            New chat
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search chats..."
            className="pl-9 pr-8 border border-primary/30 rounded-lg h-12 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
          <XCircleIcon className="h-10 w-10 text-destructive" />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground">
              Failed to load your chats. Please try again.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="gap-2"
          >
            {isRetrying ? (
              <LoaderSpinner />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Try again
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2 border-primary/30 border animate-pulse"
              >
                <Skeleton className="h-5 w-5 shrink-0 rounded bg-muted-foreground/20" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col items-start justify-between gap-2">
                    <Skeleton className="h-5 bg-muted-foreground/20 rounded w-3/4" />
                    <Skeleton className="h-3 bg-muted-foreground/20 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 p-4 text-center">
            <MessageSquareIcon className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">No chats found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a new chat to get started"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/c/${chat.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 border-primary/30 border",
                  chat.active && "bg-muted"
                )}
              >
                <MessageSquareIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 truncate flex flex-col">
                  <div className="flex flex-col items-start justify-between gap-2">
                    <span className="truncate font-medium w-full">
                      {chat.title || "Untitled"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => e.preventDefault()}
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setChatToRename(chat.id);
                        setNewTitle(chat.title || "");
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setChatToDelete(chat.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Link>
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={loadMore}
                disabled={isValidating}
              >
                {isValidating ? <LoaderSpinner /> : "Load more"}
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={chatToDelete !== null}
        onOpenChange={() => setChatToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
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
            >
              {isDeleting ? <LoaderSpinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={chatToRename !== null}
        onOpenChange={() => setChatToRename(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter a new title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChatToRename(null)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={() => chatToRename && handleRename(chatToRename)}
              disabled={isRenaming || !newTitle.trim()}
            >
              {isRenaming ? <LoaderSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
