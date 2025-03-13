"use client";

import useSWR from "swr";
import type { Chat } from "@/server/db/schema";

export function useChats({ limit }: { limit: string }) {
  return useSWR<{
    chats: Chat[];
  }>(`/api/chats?limit=${limit}`);
}
