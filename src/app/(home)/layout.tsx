import "@/styles/globals.css";
import { HomeProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/sidebar/components/theme-toggle";

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
          {/* Navigation */}
          <header className="w-full fixed top-0 inset-x-0 bg-background/80 backdrop-blur-sm border-b border-border z-50">
            <div className="container max-w-6xl mx-auto">
              <nav className="flex items-center justify-between py-2.5">
                <Link
                  href="/"
                  className="text-xl font-urbanist font-medium hover:text-primary transition-colors"
                >
                  Gemish
                </Link>
                <Button className="rounded-full " asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex w-full min-h-screen pt-16 pb-20">
            <div className="container mx-auto h-full">{children}</div>
          </main>

          {/* Footer */}
          <footer className="w-full py-6 border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="container max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Copyright © 2025 Gemish. All rights reserved.
                </p>

                <div className="flex items-center gap-6">
                  <ThemeToggle />

                  <div className="flex items-center gap-4">
                    <FooterLink href="https://x.com/gemish" external>
                      X
                    </FooterLink>
                    <FooterLink href="#">Privacy</FooterLink>
                    <FooterLink href="#">Terms</FooterLink>
                    <FooterLink href="https://github.com/gemish" external>
                      Github
                    </FooterLink>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </HomeProviders>
    </html>
  );
}

// Custom footer link component with hover states
function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
    >
      {children}
    </Link>
  );
}
