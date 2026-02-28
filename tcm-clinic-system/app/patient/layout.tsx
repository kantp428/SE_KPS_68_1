"use client";

import { PatientAppSidebar } from "@/components/layout/patient/patient-app-sidebar";
import PatientFooter from "@/components/layout/patient/patient-footer";
import PatientHeader from "@/components/layout/patient/patient-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <PatientAppSidebar />
        <SidebarInset className="flex flex-col h-screen min-w-0 overflow-hidden">
          <div className="sticky top-0 z-30 w-full flex-none">
            <PatientHeader />
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background/50">
            <div className="mx-auto w-full">{children}</div>
            <PatientFooter />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PatientLayout;
