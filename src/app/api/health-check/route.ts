// app/api/health-check/route.ts

import limiter from "@/lib/ratelimit";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { withUnkey } from "@unkey/nextjs";
import { env } from "@/env.mjs";

export const HEAD = withUnkey(
  async (req) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ratelimit = await limiter.limit(session.user.id);

    if (!ratelimit.success) {
      return new NextResponse("Please try again later", { status: 429 });
    }

    return new Response(null, { status: 200 });
  },
  { apiId: env.UNKEY_API_ID }
);
