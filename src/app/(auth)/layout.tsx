import "@/styles/globals.css";
import { AuthProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export { metadata } from "@/config/metadata";

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
          "antialiased flex items-center justify-center mx-auto min-h-screen max-w-3zl"
        )}
      >
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
