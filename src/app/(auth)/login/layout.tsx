import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login - Gemish",
  description: "Gemini AI Chatbot",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, urbanist.variable, "antialiased")}>
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
