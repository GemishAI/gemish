import "@/styles/globals.css";
import { ChatProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export { metadata } from "@/config/metadata";

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
