import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s - ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  manifest: `${siteConfig.url}/site.webmanifest`,
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
    ],
    apple: {
      rel: "apple-touch-icon",
      sizes: "180x180",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
  },
};

export const authMetadata: Metadata = {
  title: "Sign In - Gemish",
  description: "Sign in to your account to get the most out of Gemish AI",
  metadataBase: new URL(siteConfig.url),
  manifest: `${siteConfig.url}/site.webmanifest`,
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
    ],
    apple: {
      rel: "apple-touch-icon",
      sizes: "180x180",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
  },
};
