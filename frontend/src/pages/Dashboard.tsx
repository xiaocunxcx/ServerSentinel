import { Button } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import MetricCard from "../components/MetricCard";
import ResourceCard from "../components/ResourceCard";
import { clusterSummary, nodes } from "../data/mock";

const Dashboard = () => {
    const totalBusy = clusterSummary.totalDevices - clusterSummary.idleDevices;

    return (
        <div className="page">
            <div className="page-toolbar">
                <Button type="primary" icon={<RocketOutlined />}>
                    新建预约
                </Button>
            </div>
            <div className="metrics-grid">
                <MetricCard
                    title="在线节点"
                    value={`${clusterSummary.onlineNodes} / ${clusterSummary.totalNodes}`}
                    subtitle="含维护模式"
                />
                <MetricCard
                    title="可用卡数"
                    value={`${clusterSummary.idleDevices}`}
                    subtitle="30s 轮询刷新"
                />
                <MetricCard
                    title="占用中"
                    value={`${totalBusy}`}
                    subtitle="包含整机与卡级"
                />
                <MetricCard title="预计释放" value="5" subtitle="未来 6 小时" />
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
