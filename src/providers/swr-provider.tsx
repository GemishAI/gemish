"use client";

import { useSWRConfig, SWRConfig, type SWRConfiguration } from "swr";
import { toast } from "sonner";
import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";

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
      
      // Update the toast with current attempt number
      toast.loading(
        `Reconnecting... (Attempt ${reconnectAttempts.current})`, 
        { id: "network-status" }
      );
      
      fetch("/api/health-check", {
        method: "HEAD",
        cache: "no-store",
      })
        .then((res) => {
          if (res.ok) {
            // Connection restored - will be handled by the online event
            return;
          }
          throw new Error("Connection failed");
        })
        .catch(() => {
          // Schedule next retry with exponential backoff (capped at 30s)
          const backoffTime = Math.min(2000 * Math.pow(1.5, reconnectAttempts.current - 1), 30000);
          
          toast.error(
            `Unable to connect. Retrying in ${Math.round(backoffTime/1000)}s...`, 
            { id: "network-status" }
          );
          
          retryTimerRef.current = setTimeout(attemptReconnect, backoffTime);
        });
    }
  }, []);

  // Memoize the online/offline handlers
  const handleOffline = useCallback(() => {
    if (!isReconnecting.current) {
      isReconnecting.current = true;
      reconnectAttempts.current = 0;

      toast.error("Unable to connect to the internet", {
        id: "network-status",
        duration: Infinity,
      });

      // Start first reconnection attempt after a short delay
      retryTimerRef.current = setTimeout(attemptReconnect, 2000);
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
      duration: 3000 
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
    fetcher: async (resource: string, init?: RequestInit) => {
      try {
        const res = await fetch(resource, init);

        if (!res.ok) {
          const error = new Error(`API error: ${res.status}`);
          (error as any).status = res.status;
          throw error;
        }

        return res.json();
      } catch (error) {
        // Network errors will be handled by the offline detection
        throw error;
      }
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
