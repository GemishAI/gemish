import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { cookies } from "next/headers";
import { ClosedNav } from "./closed-nav";

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
      <SidebarInset>
        <div className="flex flex-1 flex-col  p-4 pt-0">
          <ClosedNav />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
