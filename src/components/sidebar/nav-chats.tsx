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
import { Button } from "../ui/button";
import { useState } from "react";
import { RefreshCw, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useChats } from "@/hooks/use-chats";

export function NavChats() {
  const { data, isLoading, error, mutate } = useChats({ limit: "20" });
  const [isRetrying, setIsRetrying] = useState(false);
  const pathname = usePathname();

  // Limit to only the 20 most recent chats
  const recentChats = data?.chats || [];
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
            <h3 className="font-medium">Unable to load conversations</h3>
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
            <h3 className="font-medium ">No conversations yet</h3>
            <p className="text-sm text-gray-500">
              Your recent conversations will appear here
            </p>
          </div>
        )}

        {recentChats.length > 0 && !isLoading && !isRetrying && !error && (
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

            <SidebarMenuItem>
              <Link
                className="font-medium flex items-center gap-2 hover:underline px-2 py-1"
                href="/recents"
              >
                <span>Show All</span>
                <ArrowRight className="size-3" />
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
