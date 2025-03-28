import { cn } from "@/lib/utils";
import { ChatProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with Gemish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.variable, urbanist.variable, "antialiased w-full")}
      >
        <ChatProviders>{children}</ChatProviders>
      </body>
    </html>
  );
}
