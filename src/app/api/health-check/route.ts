import { auth } from "@/auth/server/auth";
import { env } from "@/env.mjs";
import limiter from "@/lib/ratelimit";
import { withUnkey } from "@unkey/nextjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
