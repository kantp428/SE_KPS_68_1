"use client";

import { useEffect, useState, type ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

import { useAuth } from "@/context/AuthContext";
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

const userSign = {
  title: "TCM CLINIC",
  icon: <HeartPulse className="size-6" />,
  label: "Application",
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
  {
    title: "ตารางงาน",
    url: "/med-assist/schedule",
    icon: CalendarDays,
    children: [
      { title: "ตารางงานของฉัน", url: "/med-assist/schedule" },
      { title: "ตารางงานรวม", url: "/med-assist/schedule/staff" },
      { title: "จัดการตารางงาน", url: "/med-assist/schedule/manage" },
    ],
  },
  { title: "คนไข้", url: "/med-assist/patients", icon: Users },
  { title: "บริการ", url: "/med-assist/service", icon: ClipboardPlus },
  { title: "ห้อง", url: "/med-assist/room", icon: DoorOpen },
  { title: "ยา", url: "/med-assist/medicine", icon: Pill },
] satisfies MenuItem[];

function isActivePath(pathname: string, url: string) {
  return url === "/med-assist" ? pathname === url : pathname.startsWith(url);
}

function isActiveChild(pathname: string, url: string) {
  return pathname === url;
}

function getInitialOpenMenus(pathname: string) {
  return items.reduce<Record<string, boolean>>((acc, item) => {
    if (item.children?.length) {
      acc[item.url] = pathname.startsWith(item.url);
    }
    return acc;
  }, {});
}

type AccountButtonProps = {
  isLoading: boolean;
  fullName?: string;
  username?: string;
  role?: string;
  staffRole?: string;
};

function AccountButton({
  isLoading,
  fullName,
  username,
  role,
  staffRole,
}: AccountButtonProps) {
  return (
    <SidebarMenuButton
      size="lg"
      className="hover:bg-sidebar-accent transition-colors data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      type="button"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <UserCircle2Icon className="size-5" />
      </div>

      <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate font-semibold">
          {isLoading ? "กำลังโหลด..." : fullName || username || "Guest"}
        </span>
        <span className="truncate text-xs">
          {staffRole || role || "ผู้ใช้งาน"}
        </span>
      </div>
      <ChevronsUpDown className="ml-auto size-4 opacity-50 group-data-[state=collapsed]:hidden" />
    </SidebarMenuButton>
  );
}

export function MedAssistAppSidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    getInitialOpenMenus(pathname),
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOpenMenus((current) => {
      const next = { ...current };

      items.forEach((item) => {
        if (item.children?.length && pathname.startsWith(item.url)) {
          next[item.url] = true;
        }
      });

      return next;
    });
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            {isMounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AccountButton
                    isLoading={isLoading}
                    fullName={user?.fullName}
                    username={user?.username}
                    role={user?.role}
                    staffRole={user?.staffRole}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AccountButton
                isLoading={isLoading}
                fullName={user?.fullName}
                username={user?.username}
                role={user?.role}
                staffRole={user?.staffRole}
              />
            )}
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
                  const isOpen = openMenus[item.url] ?? false;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        onClick={() =>
                          setOpenMenus((current) => ({
                            ...current,
                            [item.url]: !current[item.url],
                          }))
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight
                          className={cn(
                            "ml-auto size-4 transition-transform group-data-[state=collapsed]:hidden",
                            isOpen && "rotate-90",
                          )}
                        />
                      </SidebarMenuButton>

                      {isOpen ? (
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
