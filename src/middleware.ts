import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {}

export const config = {
  matcher: ["/"],
};
