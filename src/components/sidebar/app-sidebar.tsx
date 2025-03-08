"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { usePathname } from "next/navigation";
import { MessageCirclePlus, MessagesSquare } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { NavUser } from "./nav-user";
import { useRouter } from "next/navigation";
import { NavChats } from "./nav-chats";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const isActive = (url: string) => pathname === url;
  const data = {
    navMain: [
      {
        title: "Start Chat",
        url: "/",
        icon: MessageCirclePlus,
        isActive: isActive("/"),
      },
      {
        title: "Recents",
        url: "/recents",
        icon: MessagesSquare,
        isActive: isActive("/recents"),
      },
    ],
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
