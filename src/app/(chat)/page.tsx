"use client";

import { StartChat } from "@/components/chat/start-chat";
import { useChat } from "@/providers/chat-provider";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  MessageSquare,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { LoaderSpinner } from "@/components/loader-spinner";
import type { Chat } from "@/server/db/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chats";

export default function ChatPage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const { isLoading, data, error, mutate } = useChats({ limit: "6" });
  const { setActiveChat } = useChat();
  const [showMoreOptions, setShowMoreOptions] = useState(true);

  // Clear active chat when visiting the start chat page
  useEffect(() => {
    setActiveChat(null);
  }, [setActiveChat]);

  const formatDate = (date: Date) => {
    const hello = new Date(date);
    const formatted = formatDistanceToNow(hello, { addSuffix: true });
    return formatted;
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await mutate();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 py-24 max-w-[750px] mx-auto w-full">
      <div>
        <StartChat />
      </div>
      {isLoading && isRetrying && (
        <div className="flex w-full justify-center">
          <LoaderSpinner height="15" width="15" />
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <h3 className="font-medium text-lg">Unable to load conversations</h3>
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
      {data && !error && !isLoading ? (
        <div className="flex flex-col gap-5 w-full">
          <div className="flex justify-between items-center w-full">
            <div
              className="flex items-center gap-2 cursor-pointer justify-center"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
            >
              <MessageSquare className="size-4" />
              Your recent chats
              <motion.div
                animate={{ rotate: showMoreOptions ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </div>

            <Link className="flex items-center hover:underline" href="/recents">
              View All
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>

          <AnimatePresence>
            {showMoreOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: {
                    duration: 0.3,
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 0.2,
                    ease: "easeInOut",
                  },
                }}
                className="grid grid-cols-3 gap-3 overflow-hidden w-full"
              >
                {data.chats && data.chats.length > 0 ? (
                  data.chats.map((chat: Chat) => (
                    <motion.div key={chat.id}>
                      <Link
                        href={`/chat/${chat.id}`}
                        className="flex flex-col justify-between shadow-xs py-4 px-4 h-40 hover:bg-muted transition-all cursor-pointer ease-in-out hover:shadow-sm rounded-xl border border-primay/50"
                      >
                        <MessageSquare className="size-4" />
                        <h1 className="text-lg font-medium truncate w-full text-balance">
                          {chat.title}
                        </h1>
                        <p className="text-sm">{formatDate(chat.updatedAt)}</p>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-6">
                    No recent chats found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        !error &&
        !isLoading && (
          <div className="text-center py-4">No chats to display</div>
        )
      )}
    </div>
  );
}
