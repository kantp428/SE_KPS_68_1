// theme/themeConfig.ts
import type { ThemeConfig } from "antd";

const colors = {
  primary: "#00b96b",
  secondary: "#003d29",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  background: "#f5f7f9",
  container: "#ffffff",
  sidebar: "#003d29",
  dark: "#666666",
};

const theme: ThemeConfig = {
  token: {
    fontFamily: "'Google Sans', 'Prompt', sans-serif",
    fontSize: 16,
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorBgLayout: colors.background,
    colorBgContainer: colors.container,
    colorBgSolid: colors.sidebar,
    colorIcon: colors.dark,
    borderRadius: 8,
  },

  components: {
    Layout: {
      headerBg: colors.container,
      siderBg: colors.sidebar,
      headerHeight: 64,
    },
    Menu: {
      darkItemBg: colors.sidebar,
      darkItemColor: "rgba(255, 255, 255, 0.65)",
      darkItemSelectedColor: "#ffffff",
      darkItemSelectedBg: colors.primary,
      darkItemHoverColor: "#ffffff",

      itemBg: "transparent",
      itemSelectedBg: "#e6f7ef",
      itemSelectedColor: colors.primary,
    },
    Button: {
      colorPrimary: colors.primary,
      borderRadius: 6,
      controlHeight: 38,
    },
    Typography: {
      fontFamilyCode: "'Chivo Mono', monospace",
    },
  },
};

export default theme;
