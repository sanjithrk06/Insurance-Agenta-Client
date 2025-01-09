import React, { useState } from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, ConfigProvider, Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../authStore";
const { Header, Content, Sider } = Layout;

const items = [
  {
    key: "records",
    label: "Records",
    icon: <AuditOutlined />,
    path: "/",
  },
  {
    key: "company",
    label: "Company",
    icon: <BankOutlined />,
    path: "/company",
  },
];

const flattenMenuItems = (items) => {
  let flattened = {};

  const flatten = (items) => {
    items.forEach((item) => {
      if (item.path) {
        flattened[item.key] = item.path;
      }
      if (item.items) {
        flatten(item.items);
      }
    });
  };

  flatten(items);
  return flattened;
};

const DashLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const findKeyByPath = (pathname) => {
    const paths = flattenMenuItems(items);
    return (
      Object.keys(paths).find((key) => paths[key] === pathname) || "dashboard"
    );
  };

  const [current, setCurrent] = useState(findKeyByPath(location.pathname));

  const onClick = (e) => {
    setCurrent(e.key);
    const paths = flattenMenuItems(items);
    if (paths[e.key]) {
      navigate(paths[e.key]);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f67009",
          colorInfo: "#f67009",
        },
      }}
    >
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div
            className="flex justify-between items-center"
            style={{ padding: "16px" }}
          >
            <div className="title text-2xl font-bold text-slate-700">
              Insurance Agenta
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "#595959", fontSize: "16px" }}
            >
              Logout
            </Button>
          </div>
        </Header>
        <Layout>
          <Sider
            className=" w-[90%] md:w-[15%] !bg-white"
            breakpoint="lg"
            collapsedWidth="0"
            onBreakpoint={(broken) => {
              console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
              console.log(collapsed, type);
            }}
          >
            <div className="title text-2xl font-bold text-white"></div>
            <Menu
              mode="inline"
              items={items}
              onDeselect={{ className: " !text-gray-500" }}
              onClick={onClick}
              selectedKeys={[current]}
              defaultOpenKeys={[location.pathname.split("/")[2]]}
              className=" text-base font-medium !text-gray-400"
            />
          </Sider>
          <Content
            style={{
              margin: "24px 16px 0",
            }}
          >
            <div
              style={{
                minHeight: 580,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default DashLayout;
