import {
    Button,
    DatePicker,
    Form,
    Modal,
    Select,
    Table,
    Tag,
    message,
    Popconfirm,
    Spin,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
    createReservation,
    deleteReservation,
    getNodes,
    getReservations,
} from "../api/endpoints";
import {
    Node,
    Reservation,
    ReservationPayload,
    ReservationType,
} from "../api/types";

const { RangePicker } = DatePicker;

interface FormValues {
    node_id: number;
    type: ReservationType;
    device_ids?: number[];
    date_range: [dayjs.Dayjs, dayjs.Dayjs];
}

const Reservations = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [form] = Form.useForm<FormValues>();
    const [reservationType, setReservationType] =
        useState<ReservationType>("machine");

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await getReservations();
            setReservations(response.data);
        } catch (error: any) {
            message.error(error.response?.data?.detail || "加载预约失败");
            console.error("Failed to fetch reservations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNodes = async () => {
        try {
            const response = await getNodes();
            setNodes(response.data);
        } catch (error: any) {
            message.error(error.response?.data?.detail || "加载节点失败");
        }
    };

    useEffect(() => {
        fetchReservations();
        fetchNodes();
    }, []);

    const nodeOptions = useMemo(
        () =>
            nodes.map((node) => ({
                label: `${node.name} (${node.ip_address})`,
                value: node.id,
            })),
        [nodes],
    );

    const getDeviceOptions = (nodeId: number) => {
        const node = nodes.find((n) => n.id === nodeId);
        return (
            node?.devices.map((d) => ({
                label: `Device ${d.device_index} (${d.model_name})`,
                value: d.id,
            })) || []
        );
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteReservation(id);
            message.success("预约已释放");
            fetchReservations();
        } catch (error: any) {
            message.error(error.response?.data?.detail || "释放预约失败");
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload: ReservationPayload = {
                node_id: values.node_id,
                type: values.type,
                start_time: values.date_range[0].toISOString(),
                end_time: values.date_range[1].toISOString(),
            };

            if (values.type === "device" && values.device_ids) {
                payload.device_ids = values.device_ids;
            }

            await createReservation(payload);
            message.success("预约创建成功");
            setOpen(false);
            form.resetFields();
            setReservationType("machine");
            fetchReservations();
        } catch (error: any) {
            if (error.errorFields) {
                // 表单验证错误，不显示 message
                return;
            }
            message.error(error.response?.data?.detail || "创建预约失败");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatus = (reservation: Reservation) => {
        const now = new Date();
        const start = new Date(reservation.start_time);
        const end = new Date(reservation.end_time);

        if (now < start) return { text: "已排期", color: "blue" };
        if (now >= start && now < end)
            return { text: "进行中", color: "success" };
        return { text: "已结束", color: "default" };
    };

    const nodeById = useMemo(() => {
        return new Map(nodes.map((node) => [node.id, node]));
    }, [nodes]);

    const columns = [
        { title: "预约号", dataIndex: "id", key: "id", width: 80 },
        {
            title: "节点",
            dataIndex: "node_id",
            key: "node",
            render: (nodeId: number) => nodeById.get(nodeId)?.name || "-",
        },
        {
            title: "模式",
            dataIndex: "type",
            key: "type",
            render: (type: ReservationType) => (
                <Tag color={type === "machine" ? "purple" : "cyan"}>
                    {type === "machine" ? "整机独占" : "卡级拼车"}
                </Tag>
            ),
        },
        {
            title: "设备",
            dataIndex: "reserved_devices",
            key: "reserved_devices",
            render: (devices: Node["devices"], record: Reservation) => {
                if (record.type === "machine") return "全部";
                return devices?.map((d) => d.device_index).join(", ") || "-";
            },
        },
        {
            title: "开始时间",
            dataIndex: "start_time",
            key: "start_time",
            render: (time: string) => dayjs(time).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "结束时间",
            dataIndex: "end_time",
            key: "end_time",
            render: (time: string) => dayjs(time).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "状态",
            key: "status",
            render: (_: any, record: Reservation) => {
                const status = getStatus(record);
                return <Tag color={status.color}>{status.text}</Tag>;
            },
        },
        {
            title: "操作",
            key: "action",
            render: (_: any, record: Reservation) => {
                return (
                    <Popconfirm
                        title="确认释放"
                        description="确定要释放这个预约吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger>
                            释放
                        </Button>
                    </Popconfirm>
                );
            },
        },
    ];

    const selectedNode = Form.useWatch("node_id", form);

    return (
        <div className="page">
            <div className="page-toolbar">
                <Button type="primary" onClick={() => setOpen(true)}>
                    新建预约
                </Button>
            </div>
            <div className="panel-card">
                {loading && reservations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={reservations}
                        pagination={{ pageSize: 10 }}
                        rowKey="id"
                    />
                )}
            </div>
            <Modal
                open={open}
                onCancel={() => {
                    setOpen(false);
                    form.resetFields();
                    setReservationType("machine");
                }}
                onOk={handleSubmit}
                title="创建新预约"
                okText="提交预约"
                cancelText="取消"
                confirmLoading={submitting}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        type: "machine",
                    }}
                >
                    <Form.Item
                        label="节点"
                        name="node_id"
                        rules={[{ required: true, message: "请选择节点" }]}
                    >
                        <Select
                            options={nodeOptions}
                            placeholder="选择节点"
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                    <Form.Item
                        label="预约类型"
                        name="type"
                        rules={[{ required: true, message: "请选择预约类型" }]}
                    >
                        <Select
                            options={[
                                { label: "整机独占", value: "machine" },
                                { label: "卡级拼车", value: "device" },
                            ]}
                            onChange={(value) => setReservationType(value)}
                        />
                    </Form.Item>
                    {reservationType === "device" && (
                        <Form.Item
                            label="设备"
                            name="device_ids"
                            rules={[{ required: true, message: "请选择设备" }]}
                        >
                            <Select
                                mode="multiple"
                                options={getDeviceOptions(selectedNode || 0)}
                                placeholder="选择需要的设备"
                                disabled={!selectedNode}
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        label="时间段"
                        name="date_range"
                        rules={[{ required: true, message: "请选择时间段" }]}
                    >
                        <RangePicker
                            style={{ width: "100%" }}
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            disabledDate={(current) =>
                                current && current < dayjs().startOf("day")
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Reservations;
