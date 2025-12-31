import { Button, DatePicker, Form, Modal, Select, Table, Tag } from "antd";
import { useMemo, useState } from "react";
import { nodes, reservations } from "../data/mock";

const Reservations = () => {
    const [open, setOpen] = useState(false);
    const options = useMemo(
        () => nodes.map((node) => ({ label: node.name, value: node.id })),
        [],
    );

    const columns = [
        { title: "预约号", dataIndex: "id", key: "id" },
        { title: "节点", dataIndex: "node", key: "node" },
        { title: "模式", dataIndex: "type", key: "type" },
        { title: "设备", dataIndex: "devices", key: "devices" },
        { title: "开始时间", dataIndex: "startTime", key: "startTime" },
        { title: "结束时间", dataIndex: "endTime", key: "endTime" },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (value: string) => (
                <Tag color={value === "active" ? "green" : "blue"}>
                    {value === "active" ? "进行中" : "已排期"}
                </Tag>
            ),
        },
    ];

    return (
        <div className="page">
            <div className="page-toolbar">
                <Button type="primary" onClick={() => setOpen(true)}>
                    新建预约
                </Button>
            </div>
            <div className="panel-card">
                <Table
                    columns={columns}
                    dataSource={reservations}
                    pagination={false}
                    rowKey="id"
                />
            </div>
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => setOpen(false)}
                title="创建新预约"
                okText="提交预约"
            >
                <Form layout="vertical">
                    <Form.Item label="节点">
                        <Select options={options} placeholder="选择节点" />
                    </Form.Item>
                    <Form.Item label="预约类型">
                        <Select
                            options={[
                                { label: "整机独占", value: "host" },
                                { label: "卡级拼车", value: "device" },
                            ]}
                            placeholder="选择模式"
                        />
                    </Form.Item>
                    <Form.Item label="设备">
                        <Select
                            mode="multiple"
                            placeholder="选择需要的设备 (0-7)"
                        />
                    </Form.Item>
                    <Form.Item label="时间段">
                        <DatePicker.RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Reservations;
