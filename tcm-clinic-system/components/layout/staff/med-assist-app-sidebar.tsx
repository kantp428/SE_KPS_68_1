"use client";

import { useEffect, useState, type ComponentType } from "react";

import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  ClipboardPlus,
  Cross,
  DoorOpen,
  HeartPulse,
  Home,
  LogOut,
  Pill,
  ReceiptText,
  UserCircle2Icon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const userSign = {
  title: "TCM CLINIC",
  icon: <HeartPulse className="size-6" />,
  label: "Application",
};

// Mock user removed

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
  { title: "จอง", url: "/med-assist/appointment", icon: Calendar },
  {
    title: "การบำบัด",
    url: "/med-assist/treatment",
    icon: Cross,
    children: [
      { title: "รายการการบำบัด", url: "/med-assist/treatment" },
      { title: "เพิ่มการบำบัด", url: "/med-assist/treatment/new" },
    ],
  },
  { title: "การชำระเงิน", url: "/med-assist/payment", icon: ReceiptText },
  { title: "ตารางงาน", url: "/med-assist/schedule", icon: CalendarDays },
  { title: "คนไข้", url: "/med-assist/patients", icon: Users },
  { title: "บริการ", url: "/med-assist/service", icon: ClipboardPlus },
  { title: "ห้อง", url: "/med-assist/room", icon: DoorOpen },
  { title: "ยา", url: "/med-assist/medicine", icon: Pill },
] satisfies MenuItem[];

function isActivePath(pathname: string, url: string) {
  return url === "/med-assist" ? pathname === url : pathname.startsWith(url);
}

// Exact match for child/leaf items to prevent parent URL bleeding into siblings
function isActiveChild(pathname: string, url: string) {
  return pathname === url;
}

export function MedAssistAppSidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth() || {};
  const [isTreatmentOpen, setIsTreatmentOpen] = useState(
    pathname.startsWith("/med-assist/treatment"),
  );

  useEffect(() => {
    if (pathname.startsWith("/med-assist/treatment")) {
      setIsTreatmentOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-sidebar-accent transition-colors data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <UserCircle2Icon className="size-5" />
                  </div>

                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                    <span className="truncate font-semibold">
                      {isLoading
                        ? "กำลังโหลด..."
                        : user?.fullName || user?.username || "Guest"}
                    </span>
                    <span className="truncate text-xs">
                      {user?.staffRole || user?.role || "ผู้ใช้งาน"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50 group-data-[state=collapsed]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="size-4 mr-2" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                                isActive={isActiveChild(pathname, child.url)}
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
