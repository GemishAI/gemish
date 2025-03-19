"use client";

import { StartChat } from "@/components/chat/start-chat";
import { useChat } from "@/providers/chat-provider";
import { useEffect, useState, useTransition } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const { setActiveChat } = useChat();
  const [showMoreOptions, setShowMoreOptions] = useState(true);

  // Clear active chat when visiting the start chat page
  useEffect(() => {
    setActiveChat(null);
  }, [setActiveChat]);

  return (
    <div className="flex flex-col gap-10 pt-24  w-full min-h-screen">
      <StartChat />
    </div>
  );
}
