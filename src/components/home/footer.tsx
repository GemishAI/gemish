"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export function Footer() {
  const posthog = usePostHog();
  return (
    <footer className="w-full py-6 border-t border-border">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            Copyright © 2025 Gemish. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <FooterLink href="https://x.com/GemishAI" external>
                X
              </FooterLink>
              <FooterLink href="https://github.com/GemishAI/gemish" external>
                Github
              </FooterLink>

              <FooterLink
                onClick={() => posthog.capture("privacy_policy")}
                href="/privacy"
              >
                Privacy Policy
              </FooterLink>
              <FooterLink
                onClick={() => posthog.capture("terms_of_service")}
                href="/terms"
              >
                Terms of Service
              </FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  external = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      onClick={onClick}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
    >
      {children}
    </Link>
  );
}
