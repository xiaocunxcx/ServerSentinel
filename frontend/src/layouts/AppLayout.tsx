import {
    AppstoreOutlined,
    CloudOutlined,
    DeploymentUnitOutlined,
    KeyOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Badge, Layout, Menu, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { authStore } from "../api/client";
import { getCurrentUser } from "../api/endpoints";
import { CurrentUser } from "../api/types";
import { clusterSummary } from "../data/mock";

const { Header, Sider, Content } = Layout;

const items = [
    {
        key: "/",
        icon: <AppstoreOutlined />,
        label: <Link to="/">资源矩阵</Link>,
    },
    {
        key: "/reservations",
        icon: <DeploymentUnitOutlined />,
        label: <Link to="/reservations">我的预约</Link>,
    },
    {
        key: "/nodes",
        icon: <CloudOutlined />,
        label: <Link to="/nodes">节点清单</Link>,
    },
    {
        key: "/keys",
        icon: <KeyOutlined />,
        label: <Link to="/keys">SSH 公钥</Link>,
    },
    {
        key: "/admin/assets",
        icon: <SettingOutlined />,
        label: <Link to="/admin/assets">资产管理</Link>,
    },
];

const headerMetaList = [
    {
        key: "/",
        title: "资源矩阵",
        subtitle: "全局视角掌握每台服务器与卡级资源占用状态。",
    },
    {
        key: "/reservations",
        title: "我的预约",
        subtitle: "集中管理你的整机/卡级预约，支持快速释放或续租。",
    },
    {
        key: "/nodes",
        title: "节点清单",
        subtitle: "查看所有节点健康度、标签与管理入口。",
    },
    {
        key: "/keys",
        title: "SSH 公钥",
        subtitle: "管理你的 SSH 公钥，预约生效时自动下发。",
    },
    {
        key: "/admin/assets",
        title: "资产管理",
        subtitle: "新增节点、录入设备信息并打标。",
    },
];

const resolveHeaderMeta = (pathname: string) => {
    if (pathname.startsWith("/nodes/")) {
        return {
            title: "节点详情",
            subtitle: "节点实时状态与设备明细。",
        };
    }
    if (pathname === "/") {
        return headerMetaList[0];
    }
    const matched = headerMetaList.find(
        (item) => item.key !== "/" && pathname.startsWith(item.key),
    );
    return matched ?? headerMetaList[0];
};

const getInitials = (value?: string) => {
    if (!value) {
        return "??";
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return "??";
    }
    return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
};

const AppLayout = () => {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const selectedKey = items.find((item) =>
        location.pathname === "/"
            ? item.key === "/"
            : item.key !== "/" && location.pathname.startsWith(item.key),
    )?.key;
    const headerMeta = useMemo(
        () => resolveHeaderMeta(location.pathname),
        [location.pathname],
    );

    useEffect(() => {
        if (!authStore.getToken()) {
            setCurrentUser(null);
            return;
        }
        let ignore = false;
        getCurrentUser()
            .then((response) => {
                if (!ignore) {
                    setCurrentUser(response.data);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setCurrentUser(null);
                }
            });
        return () => {
            ignore = true;
        };
    }, []);

    const displayName = currentUser?.username ?? "访客";
    const roleLabel = currentUser
        ? currentUser.is_admin
            ? "管理员"
            : "成员"
        : "未登录";

    return (
        <Layout className="app-shell">
            <Sider width={260} className="app-sider">
                <div className="brand">
                    <div className="brand-mark">SS</div>
                    <div>
                        <div className="brand-title">ServerSentinel</div>
                        <div className="brand-subtitle">
                            NPU Resource Command
                        </div>
                    </div>
                </div>
                <Menu
                    mode="inline"
                    items={items}
                    selectedKeys={selectedKey ? [selectedKey] : []}
                />
                <div className="sider-footer">
                    <div className="sider-foot-title">系统状态</div>
                    <Space direction="vertical" size={6}>
                        <span className="muted">
                            节点在线{" "}
                            <strong>{clusterSummary.onlineNodes}</strong> /{" "}
                            {clusterSummary.totalNodes}
                        </span>
                        <span className="muted">
                            设备可用{" "}
                            <strong>{clusterSummary.idleDevices}</strong> /{" "}
                            {clusterSummary.totalDevices}
                        </span>
                    </Space>
                </div>
            </Sider>
            <Layout>
                <Header className="app-header">
                    <div>
                        <div className="header-title">{headerMeta.title}</div>
                        <div className="header-subtitle">
                            {headerMeta.subtitle}
                        </div>
                    </div>
                    <Space size={16} wrap>
                        <Badge dot color="#0c8c7d">
                            <span className="header-pill">授权更新中</span>
                        </Badge>
                        <div className="header-user">
                            <span className="avatar">
                                {getInitials(displayName)}
                            </span>
                            <div className="header-user-info">
                                <div className="user-name">{displayName}</div>
                                <div className="user-role">{roleLabel}</div>
                            </div>
                        </div>
                    </Space>
                </Header>
                <Content className="app-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
