import { Button, Form, Input, List, Modal } from "antd";
import { useState } from "react";

const demoKeys = [
    {
        id: 1,
        name: "MacBook Pro",
        fingerprint: "SHA256:xh9uV...reY1",
        value: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG...",
    },
    {
        id: 2,
        name: "CI Runner",
        fingerprint: "SHA256:p9M2Q...g1T3",
        value: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ...",
    },
];

const Keys = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="page">
            <div className="page-toolbar">
                <Button type="primary" onClick={() => setOpen(true)}>
                    新增公钥
                </Button>
            </div>
            <div className="panel-card">
                <List
                    dataSource={demoKeys}
                    renderItem={(item) => (
                        <List.Item
                            actions={[<Button key="remove">删除</Button>]}
                        >
                            <List.Item.Meta
                                title={item.name}
                                description={item.fingerprint}
                            />
                            <span className="mono">{item.value}</span>
                        </List.Item>
                    )}
                />
            </div>
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => setOpen(false)}
                title="上传 SSH 公钥"
                okText="保存"
            >
                <Form layout="vertical">
                    <Form.Item label="名称">
                        <Input placeholder="例如: Workstation-01" />
                    </Form.Item>
                    <Form.Item label="公钥内容">
                        <Input.TextArea
                            rows={4}
                            placeholder="ssh-ed25519 AAAA..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Keys;
