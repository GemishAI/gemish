"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { usePathname } from "next/navigation";
import { MessageCirclePlus, MessagesSquare } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { NavUser } from "./nav-user";
import { NavChats } from "./nav-chats";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  const data = {
    navMain: [
      {
        title: "Start new chat",
        url: "/",
        icon: MessageCirclePlus,
        isActive: isActive("/"),
      },
      {
        title: "Chats",
        url: "/recents",
        icon: MessagesSquare,
        isActive: isActive("/recents"),
      },
    ],
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-3">
        <nav className="flex flex-row justify-between items-center px-2">
          <h1 className="text-lg font-semibold">Gemish</h1>
          <SidebarTrigger />
        </nav>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
