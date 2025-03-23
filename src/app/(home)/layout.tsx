import "@/styles/globals.css";
import { HomeProviders } from "@/providers/providers";
import { inter, urbanist } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";

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
          "antialiased min-h-screen w-full bg-gradient-to-b dark:from-gray-900 dark:to-black dark"
        )}
      >
        <HomeProviders>
          {/* Navigation */}
          <HomeNav />

          {/* Main Content */}

          <div className=" mx-auto min-h-screen w-full container max-w-6xl flex items-center justify-center py-10">
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </HomeProviders>
      </body>
    </html>
  );
}

// Custom footer link component with hover states
