"use client";

import { StaffAppSidebar } from "@/components/layout/staff/staff-app-sidebar";
import StaffFooter from "@/components/layout/staff/staff-footer";
import StaffHeader from "@/components/layout/staff/staff-header";
import { SidebarProvider } from "@/components/ui/sidebar";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <StaffAppSidebar />
        <div className="flex flex-col flex-1">
          <StaffHeader />
          <main className="flex-1 p-6">{children}</main>
          <StaffFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StaffLayout;
