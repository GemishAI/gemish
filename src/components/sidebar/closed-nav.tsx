"use client";

import { useSidebar, SidebarTrigger } from "../ui/sidebar";
import Link from "next/link";

export function ClosedNav() {
  const { state } = useSidebar();

  if (state === "expanded") return null;

  return (
    <div className="flex flex-col justify-between h-screen sticky left-0 inset-y-0 px-5 py-4">
      <h1 className="text-lg font-semibold">
        <Link href="/">Gemish</Link>
      </h1>
      <SidebarTrigger />
    </div>
  );
}
