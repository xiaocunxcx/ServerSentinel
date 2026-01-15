import { Button, Card, Form, Input, InputNumber, Select, message, Tabs } from "antd";
import { PlusOutlined, DatabaseOutlined } from "@ant-design/icons";
import { useState } from "react";

const AdminAssets = () => {
    const [nodeForm] = Form.useForm();
    const [deviceForm] = Form.useForm();
    const [submittingNode, setSubmittingNode] = useState(false);
    const [submittingDevice, setSubmittingDevice] = useState(false);

    const handleCreateNode = async () => {
        try {
            await nodeForm.validateFields();
            setSubmittingNode(true);
            message.success("节点创建成功（演示模式）");
            nodeForm.resetFields();
        } catch (error: any) {
            if (error?.errorFields) {
                return;
            }
            message.error("节点创建失败");
        } finally {
            setSubmittingNode(false);
        }
    };

    const handleCreateDevices = async () => {
        try {
            await deviceForm.validateFields();
            setSubmittingDevice(true);
            message.success("设备批量录入成功（演示模式）");
            deviceForm.resetFields();
        } catch (error: any) {
            if (error?.errorFields) {
                return;
            }
            message.error("设备创建失败");
        } finally {
            setSubmittingDevice(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>资产管理</h1>
                    <p>管理员专用：创建新节点并批量录入设备信息。</p>
                </div>
            </div>
            <Tabs
                defaultActiveKey="nodes"
                items={[
                    {
                        key: "nodes",
                        label: (
                            <span>
                                <PlusOutlined />
                                新增节点
                            </span>
                        ),
                        children: (
                            <Card className="panel-card">
                                <Form
                                    form={nodeForm}
                                    layout="vertical"
                                    initialValues={{ ssh_port: 22 }}
                                >
                                    <Form.Item
                                        label="节点名称"
                                        name="name"
                                        rules={[
                                            { required: true, message: "请输入节点名称" },
                                        ]}
                                    >
                                        <Input
                                            placeholder="例如: Atlas-Train-11"
                                            prefix={<DatabaseOutlined />}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="IP 地址"
                                        name="ip_address"
                                        rules={[
                                            { required: true, message: "请输入IP地址" },
                                            {
                                                pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                                                message: "IP地址格式不正确",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="10.8.12.11" />
                                    </Form.Item>
                                    <Form.Item
                                        label="SSH 端口"
                                        name="ssh_port"
                                        rules={[
                                            { required: true, message: "请输入SSH端口" },
                                        ]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={65535}
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="标签"
                                        name="tags"
                                        tooltip="用逗号分隔多个标签"
                                    >
                                        <Select
                                            mode="tags"
                                            placeholder="例如: Team:Algo, Env:Prod"
                                        />
                                    </Form.Item>
                                    <Form.Item label="状态" name="status" initialValue="online">
                                        <Select>
                                            <Select.Option value="online">在线</Select.Option>
                                            <Select.Option value="offline">离线</Select.Option>
                                            <Select.Option value="maintenance">维护中</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        onClick={handleCreateNode}
                                        loading={submittingNode}
                                        icon={<PlusOutlined />}
                                    >
                                        创建节点
                                    </Button>
                                </Form>
                            </Card>
                        ),
                    },
                    {
                        key: "devices",
                        label: (
                            <span>
                                <DatabaseOutlined />
                                批量录入设备
                            </span>
                        ),
                        children: (
                            <Card className="panel-card">
                                <Form form={deviceForm} layout="vertical">
                                    <Form.Item
                                        label="所属节点"
                                        name="node_id"
                                        rules={[
                                            { required: true, message: "请选择节点" },
                                        ]}
                                    >
                                        <Select placeholder="选择节点">
                                            <Select.Option value={1}>节点 #1 (Atlas-Train-01)</Select.Option>
                                            <Select.Option value={2}>节点 #2 (Atlas-Train-02)</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="设备型号"
                                        name="model_name"
                                        rules={[
                                            { required: true, message: "请输入设备型号" },
                                        ]}
                                    >
                                        <Input placeholder="例如: Ascend 910B" />
                                    </Form.Item>
                                    <Form.Item
                                        label="设备数量"
                                        name="device_count"
                                        rules={[
                                            { required: true, message: "请输入设备数量" },
                                        ]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={16}
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        onClick={handleCreateDevices}
                                        loading={submittingDevice}
                                        icon={<PlusOutlined />}
                                    >
                                        提交设备信息
                                    </Button>
                                </Form>
                            </Card>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default AdminAssets;
