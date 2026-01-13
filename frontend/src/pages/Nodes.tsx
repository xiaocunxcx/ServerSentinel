import { Table, Tag, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNodes } from "../api/endpoints";
import { Node } from "../api/types";

const Nodes = () => {
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<Node[]>([]);

    const fetchNodes = async () => {
        try {
            setLoading(true);
            const response = await getNodes();
            setNodes(response.data);
        } catch (error: any) {
            message.error(error.response?.data?.detail || "加载节点失败");
            console.error("Failed to fetch nodes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNodes();
    }, []);

    const columns = [
        {
            title: "节点",
            dataIndex: "name",
            key: "name",
            render: (_: string, record: Node) => (
                <Link to={`/nodes/${record.id}`}>{record.name}</Link>
            ),
        },
        {
            title: "IP 地址",
            dataIndex: "ip_address",
            key: "ip_address",
        },
        {
            title: "SSH 端口",
            dataIndex: "ssh_port",
            key: "ssh_port",
        },
        {
            title: "设备数",
            dataIndex: "devices",
            key: "devices",
            render: (devices: Node["devices"]) => devices?.length || 0,
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (value: string) => (
                <Tag
                    color={
                        value === "online"
                            ? "success"
                            : value === "maintenance"
                              ? "warning"
                              : "error"
                    }
                >
                    {value === "online"
                        ? "在线"
                        : value === "maintenance"
                          ? "维护中"
                          : "离线"}
                </Tag>
            ),
        },
    ];

    return (
        <div className="page">
            <div className="panel-card">
                {loading && nodes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={nodes}
                        pagination={{ pageSize: 10 }}
                        rowKey="id"
                    />
                )}
            </div>
        </div>
    );
};

export default Nodes;
