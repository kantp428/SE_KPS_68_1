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
} from "@/components/ui/sidebar";
import {
  CalendarDays,
  ChevronsUpDown,
  ClipboardPlus,
  DoorOpen,
  HeartPulse,
  Home,
  UserCircle2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const userSign = {
  title: "TCM CLINIC",
  icon: <HeartPulse className="size-6" />,
  label: "Application",
};

// Mock user removed in favor of AuthContext

const items = [
  { title: "หน้าหลัก", url: "/doctor", icon: Home },
  { title: "การบำบัด", url: "/doctor/treatment", icon: ClipboardPlus },
  { title: "ตารางงาน", url: "/doctor/schedule", icon: CalendarDays },
];

export function DoctorAppSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth() || {};
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent transition-colors"
            >
              {/* The Avatar Icon Container */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UserCircle2Icon className="size-5" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                <span className="truncate font-semibold">
                  {isLoading ? "กำลังโหลด..." : (user?.fullName || user?.username || "Guest")}
                </span>
                <span className="truncate text-xs">
                  {user?.staffRole || user?.role || "ผู้ใช้งาน"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[state=collapsed]:hidden opacity-50" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.url === "/doctor"
                    ? pathname === "/doctor"
                    : pathname.startsWith(item.url);
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
