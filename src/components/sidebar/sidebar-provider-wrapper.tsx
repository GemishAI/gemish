import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { cookies } from "next/headers";
import { ClosedNav } from "./closed-nav";
import { MobileNav } from "./mobile-nav";

export async function SidebarProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <ClosedNav />
      <SidebarInset>
        <MobileNav />
        <div className="flex  max-w-[825px] mx-auto flex-col w-full h-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
