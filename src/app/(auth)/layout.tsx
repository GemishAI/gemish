import "@/styles/globals.css";
import { AuthProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) redirect("/chat");

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
