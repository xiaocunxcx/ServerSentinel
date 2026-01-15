import { Button, message, Input, Select, Space, Skeleton } from "antd";
import {
    CloudServerOutlined,
    ThunderboltOutlined,
    LockOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import ResourceCard from "../components/ResourceCard";
import { getCurrentUser, getNodes, getReservations } from "../api/endpoints";
import { ClusterStats, CurrentUser, Node, Reservation } from "../api/types";

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
    const [stats, setStats] = useState<ClusterStats>({
        totalNodes: 0,
        onlineNodes: 0,
        offlineNodes: 0,
        totalDevices: 0,
        idleDevices: 0,
        reservedDevices: 0,
        activeReservations: 0,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [nodesRes, reservationsRes, userRes] = await Promise.all([
                getNodes(),
                getReservations(),
                getCurrentUser(),
            ]);

            const nodesData = nodesRes.data;
            const reservationsData = reservationsRes.data;

            setNodes(nodesData);
            setCurrentUser(userRes.data);

            // 计算统计数据
            const now = new Date();
            const activeReservationsData = reservationsData.filter(
                (r: Reservation) =>
                    new Date(r.start_time) <= now && new Date(r.end_time) > now,
            );

            setActiveReservations(activeReservationsData);

            const totalNodes = nodesData.length;
            const onlineNodes = nodesData.filter(
                (n: Node) => n.status === "online",
            ).length;
            const offlineNodes = nodesData.filter(
                (n: Node) => n.status === "offline",
            ).length;

            let totalDevices = 0;
            let reservedDevices = 0;

            // 计算每个节点的设备占用情况
            const deviceReservations = new Map<number, Reservation[]>();

            activeReservationsData.forEach((r: Reservation) => {
                if (!deviceReservations.has(r.node_id)) {
                    deviceReservations.set(r.node_id, []);
                }
                deviceReservations.get(r.node_id)!.push(r);
            });

            nodesData.forEach((node: Node) => {
                totalDevices += node.devices?.length || 0;

                const nodeReservations = deviceReservations.get(node.id) || [];
                const machineReservations = nodeReservations.filter(
                    (r) => r.type === "machine",
                );

                if (machineReservations.length > 0) {
                    // 整机预约，所有设备被占用
                    reservedDevices += node.devices?.length || 0;
                } else {
                    // 卡级预约，计算被预约的设备数量
                    nodeReservations.forEach((r) => {
                        if (r.reserved_devices) {
                            reservedDevices += r.reserved_devices.length;
                        }
                    });
                }
            });

            const idleDevices = totalDevices - reservedDevices;

            setStats({
                totalNodes,
                onlineNodes,
                offlineNodes,
                totalDevices,
                idleDevices,
                reservedDevices,
                activeReservations: activeReservationsData.length,
            });
        } catch (error: any) {
            message.error(error.response?.data?.detail || "加载数据失败");
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // 每 30 秒刷新一次
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const totalBusy = stats.totalDevices - stats.idleDevices;

    const filteredNodes = nodes.filter(node => {
        const matchesSearch = !searchText ||
            node.name.toLowerCase().includes(searchText.toLowerCase()) ||
            node.ip_address.includes(searchText);

        const matchesStatus = statusFilter === 'all' || node.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading && nodes.length === 0) {
        return (
            <div className="page">
                <div className="metrics-grid">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} active />
                    ))}
                </div>
                <div className="section-title">
                    <span>集群节点</span>
                </div>
                <div className="resource-grid">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton.Node key={i} active style={{ height: 280 }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-toolbar">
                <Space>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="搜索节点名称或IP"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Select
                        prefix={<FilterOutlined />}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 140 }}
                    >
                        <Select.Option value="all">全部状态</Select.Option>
                        <Select.Option value="online">在线</Select.Option>
                        <Select.Option value="offline">离线</Select.Option>
                    </Select>
                </Space>
                <Button
                    type="primary"
                    onClick={() => navigate("/reservations")}
                >
                    新建预约
                </Button>
            </div>
            <div className="metrics-grid">
                <MetricCard
                    title="在线节点"
                    value={`${stats.onlineNodes} / ${stats.totalNodes}`}
                    subtitle="含维护模式"
                    icon={<CloudServerOutlined />}
                />
                <MetricCard
                    title="可用卡数"
                    value={`${stats.idleDevices}`}
                    subtitle="30s 轮询刷新"
                    icon={<ThunderboltOutlined />}
                    color="#52c41a"
                />
                <MetricCard
                    title="占用中"
                    value={`${totalBusy}`}
                    subtitle="包含整机与卡级"
                    icon={<LockOutlined />}
                    color="#d97706"
                />
                <MetricCard
                    title="活跃预约"
                    value={`${stats.activeReservations}`}
                    subtitle="当前进行中"
                    icon={<ClockCircleOutlined />}
                    color="#1890ff"
                />
            </div>
            <div className="section-title">
                <span>集群节点 {filteredNodes.length > 0 && `(${filteredNodes.length})`}</span>
                <span className="muted">悬停可查看占用详情</span>
            </div>
            <div className="resource-grid">
                {filteredNodes.length > 0 ? (
                    filteredNodes.map((node) => (
                        <ResourceCard
                            key={node.id}
                            node={node}
                            reservations={activeReservations}
                            currentUser={currentUser}
                            onClick={() => navigate(`/nodes/${node.id}`)}
                        />
                    ))
                ) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--ink-muted)'
                    }}>
                        {searchText || statusFilter !== 'all' ? '未找到匹配的节点' : '暂无节点数据'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
