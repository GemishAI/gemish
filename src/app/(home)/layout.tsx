import "@/styles/globals.css";
import { HomeProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export { metadata } from "@/config/metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <HomeProviders>
        <body
          className={cn(
            inter.variable,
            urbanist.variable,
            "antialiased min-h-screen w-full"
          )}
        >
          <nav className="w-full flex items-center justify-between py-4 px-6 fixed top-0 inset-x-0 bg-background h-fit">
            <Link href="/" className="text-xl font-urbanist font-medium">
              Gemish
            </Link>
            <Button className="rounded-full" asChild>
              <Link href={"/login"}>Login</Link>
            </Button>
          </nav>
          <div className="flex mx-auto w-full h-full">{children}</div>
        </body>
      </HomeProviders>
    </html>
  );
}
