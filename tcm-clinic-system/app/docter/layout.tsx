"use client";

import { DocterAppSidebar } from "@/components/layout/staff/docter-app-sidebar";
import StaffFooter from "@/components/layout/staff/staff-footer";
import StaffHeader from "@/components/layout/staff/staff-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DocterAppSidebar />
        <SidebarInset className="flex flex-col h-screen min-w-0 overflow-hidden">
          <div className="sticky top-0 z-30 w-full flex-none">
            <StaffHeader />
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background/50">
            <div className="mx-auto w-full">{children}</div>
            <StaffFooter />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StaffLayout;
