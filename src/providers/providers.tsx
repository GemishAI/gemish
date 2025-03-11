import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapterProvider } from "./nuqs-adapter";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./theme-provider";
import { SidebarProviderWrapper } from "@/components/sidebar/sidebar-provider-wrapper";
import { ChatProvider } from "@/lib/context/chat-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ChatProvider>
        <SidebarProviderWrapper>
          <NuqsAdapterProvider>
            {children}
            <Toaster richColors />
            <Analytics mode="production" />
          </NuqsAdapterProvider>
        </SidebarProviderWrapper>
      </ChatProvider>
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
