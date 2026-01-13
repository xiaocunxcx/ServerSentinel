import {
    Button,
    Form,
    Input,
    List,
    Modal,
    Popconfirm,
    Spin,
    message,
} from "antd";
import { useEffect, useState } from "react";
import { createKey, deleteKey, getKeys } from "../api/endpoints";
import { SSHKey } from "../api/types";

const Keys = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [keys, setKeys] = useState<SSHKey[]>([]);
    const [form] = Form.useForm<{ public_key: string }>();

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const response = await getKeys();
            setKeys(response.data);
        } catch (error: any) {
            message.error(error.response?.data?.detail || "加载公钥失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            await createKey(values);
            message.success("公钥已添加");
            setOpen(false);
            form.resetFields();
            fetchKeys();
        } catch (error: any) {
            if (error.errorFields) {
                return;
            }
            message.error(error.response?.data?.detail || "添加公钥失败");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (keyId: number) => {
        try {
            await deleteKey(keyId);
            message.success("公钥已删除");
            fetchKeys();
        } catch (error: any) {
            message.error(error.response?.data?.detail || "删除公钥失败");
        }
    };

    return (
        <div className="page">
            <div className="page-toolbar">
                <Button type="primary" onClick={() => setOpen(true)}>
                    新增公钥
                </Button>
            </div>
            <div className="panel-card">
                {loading && keys.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <List
                        dataSource={keys}
                        locale={{ emptyText: "暂无公钥" }}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Popconfirm
                                        key="remove"
                                        title="确认删除"
                                        description="确定要删除这条公钥吗？"
                                        onConfirm={() => handleDelete(item.id)}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button danger type="link">
                                            删除
                                        </Button>
                                    </Popconfirm>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={`Key #${item.id}`}
                                    description={item.fingerprint}
                                />
                                <span className="mono">{item.public_key}</span>
                            </List.Item>
                        )}
                    />
                )}
            </div>
            <Modal
                open={open}
                onCancel={() => {
                    setOpen(false);
                    form.resetFields();
                }}
                onOk={handleCreate}
                title="上传 SSH 公钥"
                okText="保存"
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="公钥内容"
                        name="public_key"
                        rules={[{ required: true, message: "请输入 SSH 公钥" }]}
                    >
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
