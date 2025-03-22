import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapterProvider } from "./nuqs-adapter-provider";
import { ThemeProvider } from "./theme-provider";
import { SidebarProviderWrapper } from "@/components/sidebar/sidebar-provider-wrapper";
import { ChatProvider } from "./chat-provider";
import { SWRProvider } from "./swr-provider";
import { PostHogProvider } from "./posthog-provider";
import { AuthProvider } from "./auth-provider";

interface BaseProviderProps {
  children: React.ReactNode;
  disableTransitionOnChange?: boolean;
}

// Base theme provider config that's common across all providers
function BaseThemeProvider({
  children,
  disableTransitionOnChange = false,
}: BaseProviderProps) {
  return (
    <AuthProvider>
      <PostHogProvider>
        <ThemeProvider
          storageKey="gemish-theme"
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={disableTransitionOnChange}
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </PostHogProvider>
    </AuthProvider>
  );
}

export function ChatProviders({ children }: { children: React.ReactNode }) {
  return (
    <BaseThemeProvider>
      <ChatProvider>
        <SWRProvider>
          <SidebarProviderWrapper>
            <NuqsAdapterProvider>{children}</NuqsAdapterProvider>
          </SidebarProviderWrapper>
        </SWRProvider>
      </ChatProvider>
    </BaseThemeProvider>
  );
}

export function HomeProviders({ children }: { children: React.ReactNode }) {
  return <BaseThemeProvider>{children}</BaseThemeProvider>;
}

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <BaseThemeProvider disableTransitionOnChange>{children}</BaseThemeProvider>
  );
}
