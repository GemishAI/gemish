import { cn } from "@/lib/utils";
import { AuthProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import "@/styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Gemish",
  description: "Sign In to Gemish to get the most out of it.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          urbanist.variable,
          "antialiased flex items-center justify-center mx-auto min-h-screen w-full max-w-sm"
        )}
      >
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
