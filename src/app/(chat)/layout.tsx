import "@/styles/globals.css";
import { Providers } from "@/providers/providers";
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
      <body className={cn(inter.variable, urbanist.variable, "antialiased ")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
