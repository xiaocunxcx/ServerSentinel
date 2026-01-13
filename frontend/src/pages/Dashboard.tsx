import { Button, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import ResourceCard from "../components/ResourceCard";
import { getNodes, getReservations } from "../api/endpoints";
import { ClusterStats, Node, Reservation } from "../api/types";

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<Node[]>([]);
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
            const [nodesRes, reservationsRes] = await Promise.all([
                getNodes(),
                getReservations(),
            ]);

            const nodesData = nodesRes.data;
            const reservationsData = reservationsRes.data;

            setNodes(nodesData);
            // 计算统计数据
            const now = new Date();
            const activeReservations = reservationsData.filter(
                (r: Reservation) =>
                    new Date(r.start_time) <= now && new Date(r.end_time) > now,
            );

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

            activeReservations.forEach((r: Reservation) => {
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
                activeReservations: activeReservations.length,
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

    if (loading && nodes.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-toolbar">
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
                />
                <MetricCard
                    title="可用卡数"
                    value={`${stats.idleDevices}`}
                    subtitle="30s 轮询刷新"
                />
                <MetricCard
                    title="占用中"
                    value={`${totalBusy}`}
                    subtitle="包含整机与卡级"
                />
                <MetricCard
                    title="活跃预约"
                    value={`${stats.activeReservations}`}
                    subtitle="当前进行中"
                />
            </div>
            <div className="section-title">
                <span>集群节点</span>
                <span className="muted">悬停可查看占用详情</span>
            </div>
            <div className="resource-grid">
                {nodes.map((node) => (
                    <ResourceCard key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
