import { Table, Tag } from "antd";
import { Link } from "react-router-dom";
import { nodes } from "../data/mock";

const Nodes = () => {
    const columns = [
        {
            title: "节点",
            dataIndex: "name",
            key: "name",
            render: (_: string, record: (typeof nodes)[number]) => (
                <Link to={`/nodes/${record.id}`}>{record.name}</Link>
            ),
        },
        { title: "IP", dataIndex: "ip", key: "ip" },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (value: string) => (
                <Tag
                    color={
                        value === "online"
                            ? "green"
                            : value === "maintenance"
                              ? "orange"
                              : "default"
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
        {
            title: "标签",
            dataIndex: "tags",
            key: "tags",
            render: (tags: string[]) => (
                <div className="tag-list">
                    {tags.map((tag) => (
                        <span key={tag} className="tag-chip">
                            {tag}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className="page">
            <div className="panel-card">
                <Table
                    columns={columns}
                    dataSource={nodes}
                    pagination={false}
                    rowKey="id"
                />
            </div>
        </div>
    );
};

export default Nodes;
