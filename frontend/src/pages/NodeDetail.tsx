import { Button, Descriptions, Divider } from "antd";
import { useParams } from "react-router-dom";
import ResourceCard from "../components/ResourceCard";
import { nodes } from "../data/mock";

const NodeDetail = () => {
    const { id } = useParams();
    const node = nodes.find((item) => item.id === Number(id));

    if (!node) {
        return (
            <div className="page">
                <div className="panel-card">节点不存在或已下线。</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-toolbar">
                <Button type="primary">创建预约</Button>
            </div>
            <div className="panel-card">
                <Descriptions column={3}>
                    <Descriptions.Item label="IP">{node.ip}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                        {node.status === "online"
                            ? "在线"
                            : node.status === "maintenance"
                              ? "维护中"
                              : "离线"}
                    </Descriptions.Item>
                    <Descriptions.Item label="标签">
                        {node.tags.join(" / ")}
                    </Descriptions.Item>
                </Descriptions>
            </div>
            <Divider />
            <ResourceCard node={node} />
        </div>
    );
};

export default NodeDetail;
