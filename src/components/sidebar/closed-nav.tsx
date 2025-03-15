"use client";

import { useSidebar, SidebarTrigger } from "../ui/sidebar";

export function ClosedNav() {
  const { state } = useSidebar();

  if (state === "expanded") return null;

  return (
    <div className="flex flex-col justify-between h-screen sticky left-0 inset-y-0 px-5 py-4">
      <h1 className="text-lg font-semibold">Gemish</h1>
      <SidebarTrigger />
    </div>
  );
}
