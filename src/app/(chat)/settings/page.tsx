"use client";

import { CustomSettings } from "@/components/settings/account";
import { searchParams } from "@/config/search-params";
import { useQueryState } from "nuqs";
import { Billing } from "@/components/settings/billing";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const [nav] = useQueryState("nav", searchParams.nav);
  const router = useRouter();

  useEffect(() => {
    if (nav !== "account" && nav !== "billing") {
      router.push("/settings?nav=account");
    }
  }, [nav, router]);

  return (
    <div>
      {nav === "account" && <CustomSettings />}
      {nav === "billing" && <Billing />}
    </div>
  );
}
