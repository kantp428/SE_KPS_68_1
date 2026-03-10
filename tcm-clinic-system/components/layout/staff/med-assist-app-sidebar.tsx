"use client";

import { useEffect, useState, type ComponentType } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronsUpDown,
  Cross,
  DoorOpen,
  HeartPulse,
  Home,
  UserCircle2Icon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const userSign = {
  title: "TCM CLINIC",
  icon: <HeartPulse className="size-6" />,
  label: "Application",
};

const user = {
  name: "Dr. Somchai",
  role: "Clinic MedAssist",
};

type MenuItem = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  children?: Array<{
    title: string;
    url: string;
  }>;
};

const items = [
  { title: "หน้าหลัก", url: "/med-assist", icon: Home },
  { title: "การบำบัด", url: "/med-assist/treatment", icon: Cross, children: [
      { title: "รายการการบำบัด", url: "/med-assist/treatment" },
      { title: "เพิ่มการบำบัด", url: "/med-assist/treatment/new" },
    ]
  },
  { title: "ข้อมูลห้อง", url: "/med-assist/room", icon: DoorOpen },
  { title: "รายชื่อคนไข้", url: "/med-assist/patients", icon: Users },
  { title: "พนักงาน", url: "/med-assist/staff", icon: UserCircle2Icon },
] satisfies MenuItem[];

function isActivePath(pathname: string, url: string) {
  return url === "/med-assist" ? pathname === url : pathname.startsWith(url);
}


export function MedAssistAppSidebar() {
  const pathname = usePathname();
  const [isTreatmentOpen, setIsTreatmentOpen] = useState(
    pathname.startsWith("/med-assist/treatment"),
  );

  useEffect(() => {
    if (pathname.startsWith("/med-assist/treatment")) {
      setIsTreatmentOpen(true);
    }
  }, [pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent transition-colors"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UserCircle2Icon className="size-5" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-white/70">
                  {user.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50 group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{userSign.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isActivePath(pathname, item.url);

                if (item.children?.length) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        onClick={() => setIsTreatmentOpen((open) => !open)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight
                          className={cn(
                            "ml-auto size-4 transition-transform group-data-[state=collapsed]:hidden",
                            isTreatmentOpen && "rotate-90",
                          )}
                        />
                      </SidebarMenuButton>

                      {isTreatmentOpen ? (
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActivePath(pathname, child.url)}
                              >
                                <Link href={child.url}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
