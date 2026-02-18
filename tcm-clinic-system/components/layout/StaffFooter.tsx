import { Layout } from "antd";

const { Footer } = Layout;

const StaffFooter = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      Ant Design ©{new Date().getFullYear()} Created by Group 1
    </Footer>
  );
};

export default StaffFooter;
