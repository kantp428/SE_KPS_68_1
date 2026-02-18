import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import theme from "@/theme/themeConfig";

export const metadata: Metadata = {
  title: "TCM Clinic System",
  description: "ระบบบริหารจัดการคลินิกการแพทย์แผนจีน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* Preconnect เพื่อให้โหลดฟอนต์ได้เร็วขึ้น */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* โหลดเฉพาะ Google Sans และ Chivo Mono ตามที่คุณต้องการ */}
        <link
          href="https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Prompt:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <App
              notification={{ placement: "topRight", stack: { threshold: 3 } }}
            >
              {children}
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
