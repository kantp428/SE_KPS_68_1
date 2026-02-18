"use client";

import StaffFooter from "@/components/layout/StaffFooter";
import StaffHeader from "@/components/layout/StaffHeader";
import StaffSider from "@/components/layout/StaffSider";
import { Grid, Layout } from "antd";
import React, { useState } from "react";
import { App } from "antd";

const { Content } = Layout;
const { useBreakpoint } = Grid;

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  return (
    <Layout style={{ minHeight: "100vh", position: "relative" }}>
      <StaffSider collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* --- Overlay สำหรับ Mobile --- */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 1000,
            transition: "opacity 0.3s",
          }}
        />
      )}

      <Layout
        style={{
          marginLeft: !isMobile ? (collapsed ? 80 : 260) : 0,
          transition: "all 0.2s",
        }}
      >
        <StaffHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: "100%" }}>
            {children}
          </div>
        </Content>
        <StaffFooter />
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
