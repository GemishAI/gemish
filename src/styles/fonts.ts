import { Inter, Urbanist, Geist } from "next/font/google";

export const inter = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});
