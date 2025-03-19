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
import { motion, AnimatePresence } from "motion/react";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <SidebarGroup>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
      </motion.div>
      <SidebarGroupContent>
        <AnimatePresence mode="wait">
          {(isLoading || isRetrying) && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SidebarMenu>
                {Array.from({ length: 20 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              className="flex flex-col items-center justify-center gap-2 p-4 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-medium">Unable to load chats</h3>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="mt-1 flex items-center gap-1"
                >
                  <motion.div
                    animate={isRetrying ? { rotate: 360 } : {}}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                  <span>Try again</span>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {recentChats.length === 0 && !error && !isLoading && !isRetrying && (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center gap-1 p-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-medium">No conversations yet</h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm text-gray-500"
              >
                Your recent chats will appear here
              </motion.p>
            </motion.div>
          )}

          {recentChats.length > 0 && !isLoading && !isRetrying && !error && (
            <motion.div
              key="chat-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <SidebarMenu>
                {recentChats.map((chat, index) => (
                  <motion.div
                    key={chat.id || chat.title}
                    variants={itemVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(`/chat/c/${chat.id}`)}
                        className={cn(
                          "rounded-md",
                          isActive(`/chat/${chat.id}`) && "bg-black/50"
                        )}
                      >
                        <Link href={`/chat/c/${chat.id}`}>
                          <span>{chat.title || "Untitled conversation"}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}

                <motion.div
                  variants={itemVariants}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <SidebarMenuItem>
                    <motion.div
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        className="font-medium flex items-center gap-2 hover:underline px-2 py-1"
                        href="/recents"
                      >
                        <span>Show All</span>
                        <motion.div
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="size-3" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </SidebarMenuItem>
                </motion.div>
              </SidebarMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
