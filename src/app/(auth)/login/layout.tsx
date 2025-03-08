import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Login - Gemish",
  description: "Gemini AI Chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, urbanist.variable, "antialiased")}>
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
