"use client";

import { searchParams } from "@/config/search-params";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const [nav] = useQueryState("nav", searchParams.nav);
  const router = useRouter();

  useEffect(() => {
    if (nav !== "account") {
      router.push("/chat/settings?nav=account");
    }
  }, [nav, router]);

  return <div>{nav === "account" && <div>hello</div>}</div>;
}
