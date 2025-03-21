"use client";

import { useSWRConfig, SWRConfig, type SWRConfiguration } from "swr";
import { toast } from "sonner";
import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { env } from "@/env.mjs";

interface SWRProviderProps {
  children: ReactNode;
}

export const SWRProvider = ({ children }: SWRProviderProps) => {
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnecting = useRef<boolean>(false);
  const reconnectAttempts = useRef<number>(0);
  const { mutate } = useSWRConfig();

  // Memoize the reconnection attempt function
  const attemptReconnect = useCallback(() => {
    // Only run this if we're offline
    if (!navigator.onLine && isReconnecting.current) {
      reconnectAttempts.current += 1;

      // Create a promise for the reconnection attempt
      const reconnectionPromise = new Promise<boolean>((resolve, reject) => {
        const checkConnection = () => {
          fetch("/api/health-check", {
            method: "HEAD",
            cache: "no-store",
          })
            .then((res) => {
              if (res.ok) resolve(true);
              else {
                // Schedule next retry with exponential backoff (capped at 30s)
                const backoffTime = Math.min(
                  2000 * Math.pow(1.5, reconnectAttempts.current - 1),
                  30000
                );
                retryTimerRef.current = setTimeout(() => {
                  reconnectAttempts.current += 1;
                  checkConnection();
                }, backoffTime);

                // Don't reject here - keep the promise pending
              }
            })
            .catch(() => {
              // Schedule next retry with exponential backoff (capped at 30s)
              const backoffTime = Math.min(
                2000 * Math.pow(1.5, reconnectAttempts.current - 1),
                30000
              );
              retryTimerRef.current = setTimeout(() => {
                reconnectAttempts.current += 1;
                checkConnection();
              }, backoffTime);

              // Don't reject here - keep the promise pending
            });
        };

        checkConnection();
      });

      toast.promise(reconnectionPromise, {
        loading: "Connection lost. Attempting to reconnect...",
        success: "Connection restored",
        id: "network-status",
        duration: Infinity,
      });
    }
  }, []);

  // Memoize the online/offline handlers
  const handleOffline = useCallback(() => {
    if (!isReconnecting.current) {
      isReconnecting.current = true;
      reconnectAttempts.current = 0;

      // Start reconnection process immediately
      attemptReconnect();
    }
  }, [attemptReconnect]);

  const handleOnline = useCallback(() => {
    isReconnecting.current = false;
    reconnectAttempts.current = 0;

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    toast.success("Connected to the internet", {
      id: "network-status",
      duration: 3000,
    });

    // Revalidate all data
    mutate("", { revalidate: true });
  }, [mutate]);

  // Set up the event listeners
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check in case the app loads while offline
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [handleOnline, handleOffline]);

  // Define the SWR configuration with proper types
  const swrConfig: SWRConfiguration = {
    fetcher: async (resource: RequestInfo, init?: RequestInit) => {
      const headers = new Headers(init?.headers);

      headers.set("Authorization", `Bearer ${env.NEXT_PUBLIC_GEMISH_API_KEY}`);

      const response = await fetch(resource, {
        ...init,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.statusText}`);
      }

      return response.json();
    },
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    errorRetryCount: 3,
    onErrorRetry: (
      error: Error & { status?: number },
      _key: string,
      _config: any,
      revalidate: () => void,
      { retryCount }: { retryCount: number }
    ) => {
      // Don't retry on 4xx errors
      if (error.status && error.status >= 400 && error.status < 500) {
        return;
      }

      // Only retry if we're online
      if (!navigator.onLine) {
        return;
      }

      // Exponential backoff
      const timeout = Math.min(1000 * 2 ** retryCount, 30000);
      setTimeout(() => revalidate(), timeout);
    },
  };

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
};
