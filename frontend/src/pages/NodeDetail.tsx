import { Button, Descriptions, Divider, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNode } from "../api/endpoints";
import { Node } from "../api/types";
import ResourceCard from "../components/ResourceCard";

const statusLabel = (status?: string) => {
    if (status === "online") return "在线";
    if (status === "maintenance") return "维护中";
    if (status === "offline") return "离线";
    return status || "-";
};

const NodeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [node, setNode] = useState<Node | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const nodeId = Number(id);
        if (!nodeId) {
            setError("节点不存在或已下线。");
            setLoading(false);
            return;
        }

        let ignore = false;
        setLoading(true);
        setError(null);
        getNode(nodeId)
            .then((response) => {
                if (!ignore) {
                    setNode(response.data);
                }
            })
            .catch((error: any) => {
                if (ignore) {
                    return;
                }
                const detail =
                    error.response?.status === 404
                        ? "节点不存在或已下线。"
                        : error.response?.data?.detail || "加载节点失败";
                setError(detail);
                message.error(detail);
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    if (loading && !node) {
        return (
            <div className="page">
                <div className="panel-card" style={{ textAlign: "center" }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !node) {
        return (
            <div className="page">
                <div className="panel-card">
                    {error || "节点不存在或已下线。"}
                </div>
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
                    创建预约
                </Button>
            </div>
            <div className="panel-card">
                <Descriptions column={3}>
                    <Descriptions.Item label="IP">
                        {node.ip_address}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                        {statusLabel(node.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="SSH 端口">
                        {node.ssh_port}
                    </Descriptions.Item>
                </Descriptions>
            </div>
            <Divider />
            <ResourceCard node={node} />
        </div>
    );
};

export default NodeDetail;
