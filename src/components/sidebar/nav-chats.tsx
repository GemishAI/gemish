"use client";

import {
  SidebarGroup,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Chat } from "@/server/db/schema";
import { Button } from "../ui/button";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavChats() {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR<Chat[]>("/api/chats", fetcher);
  const [isRetrying, setIsRetrying] = useState(false);
  const pathname = usePathname();

  // Limit to only the 20 most recent chats
  const recentChats = chats?.slice(0, 20) || [];
  const isActive = (url: string) => pathname === url;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await mutate();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
      <SidebarGroupContent>
        {(isLoading || isRetrying) && (
          <SidebarMenu>
            {Array.from({ length: 20 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <h3 className="font-medium text-gray-800">
              Unable to load conversations
            </h3>
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </Button>
          </div>
        )}

        {recentChats.length === 0 && !error && !isLoading && !isRetrying && (
          <div className="flex flex-col items-center justify-center gap-1 p-4 text-center">
            <h3 className="font-medium text-gray-800">No conversations yet</h3>
            <p className="text-sm text-gray-500">
              Your recent conversations will appear here
            </p>
          </div>
        )}

        {recentChats.length > 0 && !isLoading && !isRetrying && (
          <SidebarMenu>
            {recentChats.map((chat) => (
              <SidebarMenuItem key={chat.id || chat.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/chat/${chat.id}`)}
                  className={cn(
                    "rounded-md",
                    isActive(`/chat/${chat.id}`) && "bg-black/50"
                  )}
                >
                  <Link href={`/chat/${chat.id}`}>
                    <span>{chat.title || "Untitled conversation"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
