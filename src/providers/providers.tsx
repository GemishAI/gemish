import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapterProvider } from "./nuqs-adapter-provider";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./theme-provider";
import { SidebarProviderWrapper } from "@/components/sidebar/sidebar-provider-wrapper";
import { ChatProvider } from "./chat-provider";
import { SWRProvider } from "./swr-provider";

export function ChatProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      storageKey="gemish-theme"
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <SWRProvider>
        <ChatProvider>
          <SidebarProviderWrapper>
            <NuqsAdapterProvider>
              {children}
              <Toaster richColors />
              <Analytics mode="production" />
            </NuqsAdapterProvider>
          </SidebarProviderWrapper>
        </ChatProvider>
      </SWRProvider>
    </ThemeProvider>
  );
}

export function HomeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      storageKey="gemish-theme"
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <NuqsAdapterProvider>
        {children}
        <Toaster richColors />
        <Analytics mode="production" />
      </NuqsAdapterProvider>
    </ThemeProvider>
  );
}

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors />
      <Analytics mode="production" />
    </ThemeProvider>
  );
}
