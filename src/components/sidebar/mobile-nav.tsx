import { SidebarTrigger } from "../ui/sidebar";
import Link from "next/link";

export function MobileNav() {
  return (
    <div className="flex items-center justify-between w-full lg:hidden backdrop-blur-lg p-4 fixed top-0 inset-x-0">
      <Link href="/chat">
        <h1 className="text-lg font-semibold">Gemish</h1>
      </Link>
      <SidebarTrigger />
    </div>
  );
}
