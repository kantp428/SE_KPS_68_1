"use client";
import { TextIndentIcon } from "@phosphor-icons/react";
import { Button, Grid, Layout, Typography } from "antd";

const { Header } = Layout;
const { useBreakpoint } = Grid;

interface StaffHeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const StaffHeader = ({ collapsed, setCollapsed }: StaffHeaderProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  return (
    <Header
      style={{
        background: "#000000",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* โชว์ปุ่ม Hamburger เฉพาะบน Mobile เท่านั้น */}
      {isMobile && (
        <Button
          type="text"
          icon={<TextIndentIcon size={25} color="#fff" weight="bold" />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: "#fff",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
          }}
        />
      )}

      <Typography.Title level={4} style={{ margin: 0, color: "#fff" }}>
        My Dashboard
      </Typography.Title>
    </Header>
  );
};

export default StaffHeader;
