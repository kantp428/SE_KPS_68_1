"use client";

import {
  CalendarDotsIcon,
  DoorIcon,
  FirstAidIcon,
  HouseIcon,
  TextIndentIcon,
  TextOutdentIcon,
} from "@phosphor-icons/react";
import { Button, Grid, Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const { Sider } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const menuItems = [
  {
    key: "/staff/dashboard",
    icon: <HouseIcon size={24} weight="bold" />,
    label: "หน้าแรก",
  },
  {
    key: "/staff/room",
    icon: <DoorIcon size={24} weight="bold" />,
    label: "ห้องบำบัด",
  },
  {
    key: "/staff/schedule",
    icon: <CalendarDotsIcon size={24} weight="bold" />,
    label: "ตารางงาน",
  },
];

interface StaffSiderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const StaffSider = ({ collapsed, setCollapsed }: StaffSiderProps) => {
  const [hovered, setHovered] = useState(false);
  const screens = useBreakpoint();
  const router = useRouter();
  const pathname = usePathname();

  const isActuallyCollapsed = collapsed && !hovered;
  const isMobile = !screens.lg;

  const getActiveKey = () => {
    const activeItem = menuItems.find((item) => pathname.startsWith(item.key));
    return activeItem ? [activeItem.key] : [pathname];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <Sider
      breakpoint="lg"
      collapsible
      trigger={isMobile ? undefined : null}
      collapsed={!isMobile ? isActuallyCollapsed : collapsed}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      width={260}
      collapsedWidth={isMobile ? 0 : 80}
      style={{
        textAlign: isActuallyCollapsed ? "center" : "left",
        overflow: "hidden",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1001,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "8px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            justifyContent: isActuallyCollapsed ? "center" : "flex-start",
            paddingLeft: isActuallyCollapsed ? "8px" : "0",
          }}
        >
          <FirstAidIcon size={32} color="#fff" weight="fill" />

          {!isActuallyCollapsed && (
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "18px",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              TCM Clinic
            </Text>
          )}
        </div>

        {!isActuallyCollapsed && (
          <Button
            type="text"
            icon={
              collapsed ? (
                <TextIndentIcon size={25} color="#fff" weight="bold" />
              ) : (
                <TextOutdentIcon size={25} color="#fff" weight="bold" />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: "absolute",
              right: "8px",
              width: 40,
              height: 40,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
            }}
          />
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getActiveKey()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default StaffSider;
