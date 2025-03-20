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
  const { mutate } = useSWRConfig();

  // Memoize the reconnection attempt function
  const attemptReconnect = useCallback(() => {
    // Only run this if we're offline
    if (!navigator.onLine && isReconnecting.current) {
      toast.promise(
        new Promise<boolean>((resolve, reject) => {
          fetch("/api/health-check", {
            method: "HEAD",
            cache: "no-store",
          })
            .then((res) => {
              if (res.ok) resolve(true);
              else reject();
            })
            .catch(() => {
              reject();
              // Schedule next retry
              retryTimerRef.current = setTimeout(attemptReconnect, 5000);
            });
        }),
        {
          loading: "Attempting to reconnect...",
          success: "Connection restored",
          error: "Reconnection failed. Retrying in 5s...",
          id: "network-reconnect",
        }
      );
    }
  }, []);

  // Memoize the online/offline handlers
  const handleOffline = useCallback(() => {
    if (!isReconnecting.current) {
      isReconnecting.current = true;

      toast.error("Unable to connect to the internet", {
        id: "network-offline",
        duration: Infinity,
      });

      attemptReconnect();
    }
  }, [attemptReconnect]);

  const handleOnline = useCallback(() => {
    isReconnecting.current = false;

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    toast.dismiss("network-offline");
    toast.success("Connected to the internet", { duration: 3000 });

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
