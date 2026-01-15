import { Table, Tag, message, Input, Select, Space, Skeleton } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNodes } from "../api/endpoints";
import { Node } from "../api/types";

const Nodes = () => {
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');

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

    const filteredNodes = nodes.filter(node => {
        const matchesSearch = !searchText ||
            node.name.toLowerCase().includes(searchText.toLowerCase()) ||
            node.ip_address.includes(searchText);

        const matchesStatus = statusFilter === 'all' || node.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
                        <Select.Option value="maintenance">维护中</Select.Option>
                    </Select>
                </Space>
            </div>
            <div className="panel-card">
                {loading && nodes.length === 0 ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : filteredNodes.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={filteredNodes}
                        pagination={{ pageSize: 10 }}
                        rowKey="id"
                    />
                ) : (
                    <div style={{
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

export default Nodes;
