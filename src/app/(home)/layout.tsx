import "@/styles/globals.css";
import { HomeProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/sidebar/components/theme-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export { metadata } from "@/config/metadata";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          urbanist.variable,
          "antialiased min-h-screen w-full bg-gradient-to-b dark:from-gray-900 dark:to-black dark"
        )}
      >
        <HomeProviders>
          {/* Navigation */}
          <header className="w-full h-16 fixed top-0 inset-x-0 z-50">
            <div className="container max-w-6xl mx-auto backdrop-blur-lg">
              <nav className="flex items-center justify-between py-2.5">
                <Link
                  href="/"
                  className="text-xl font-urbanist font-medium hover:text-primary transition-colors"
                >
                  Gemish
                </Link>
                {session ? (
                  <Button className="rounded-full " variant={"outline"} asChild>
                    <Link href="/chat">Go to Chat</Link>
                  </Button>
                ) : (
                  <Button className="rounded-full " asChild>
                    <Link href="/login" className="dark:text-white">
                      Sign In
                    </Link>
                  </Button>
                )}
              </nav>
            </div>
          </header>

          {/* Main Content */}

          <div className=" mx-auto min-h-screen w-full container max-w-6xl flex items-center justify-center py-10">
            {children}
          </div>

          {/* Footer */}
        </HomeProviders>
      </body>
    </html>
  );
}

// Custom footer link component with hover states
