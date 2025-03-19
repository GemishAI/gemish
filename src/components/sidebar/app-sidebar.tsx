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
import Link from "next/link";
import { NavUser } from "./nav-user";
import { NavChats } from "./nav-chats";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  const data = {
    navMain: [
      {
        title: "Start new chat",
        url: "/chat",
        icon: MessageCirclePlus,
        isActive: isActive("/"),
      },
      {
        title: "Chats",
        url: "/chat/recents",
        icon: MessagesSquare,
        isActive: isActive("/recents"),
      },
    ],
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-3 mt-1">
        <nav className="flex flex-row justify-between items-center px-2">
          <Link href="/chat" className="text-lg font-semibold font-urbanist">
            Gemish
          </Link>
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
