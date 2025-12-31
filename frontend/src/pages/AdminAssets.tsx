import { Button, Card, Form, Input, InputNumber, Select } from "antd";

const AdminAssets = () => {
    return (
        <div className="page">
            <div className="grid-two">
                <Card title="新增节点" className="panel-card">
                    <Form layout="vertical">
                        <Form.Item label="节点名称">
                            <Input placeholder="例如: Atlas-Train-11" />
                        </Form.Item>
                        <Form.Item label="IP 地址">
                            <Input placeholder="10.8.12.11" />
                        </Form.Item>
                        <Form.Item label="SSH 端口">
                            <InputNumber
                                min={1}
                                max={65535}
                                defaultValue={22}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                        <Form.Item label="标签">
                            <Select
                                mode="tags"
                                placeholder="例如: Team:Algo, Env:Prod"
                            />
                        </Form.Item>
                        <Button type="primary">创建节点</Button>
                    </Form>
                </Card>
                <Card title="批量录入设备" className="panel-card">
                    <Form layout="vertical">
                        <Form.Item label="所属节点">
                            <Select placeholder="选择节点" />
                        </Form.Item>
                        <Form.Item label="设备型号">
                            <Input placeholder="Ascend 910B" />
                        </Form.Item>
                        <Form.Item label="设备数量">
                            <InputNumber
                                min={1}
                                max={16}
                                defaultValue={8}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                        <Button type="primary">提交设备信息</Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default AdminAssets;
