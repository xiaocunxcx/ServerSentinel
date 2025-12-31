import { Button, Card, Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../api/client";
import { login } from "../api/endpoints";

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleFinish = async (values: {
        username: string;
        password: string;
    }) => {
        setSubmitting(true);
        try {
            const response = await login(values);
            authStore.setToken(response.data.access_token);
            messageApi.success("登录成功");
            navigate("/", { replace: true });
        } catch (error) {
            messageApi.error("登录失败，请检查用户名或密码");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            {contextHolder}
            <div className="login-hero">
                <div>
                    <div className="login-title">ServerSentinel</div>
                    <p className="login-subtitle">
                        掌控 NPU 资源，硬锁定访问路径。
                    </p>
                </div>
            </div>
            <Card className="login-card">
                <div className="login-card-title">登录控制台</div>
                <Form layout="vertical" onFinish={handleFinish}>
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input placeholder="输入用户名" />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: "请输入密码" }]}
                    >
                        <Input.Password placeholder="输入密码" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={submitting}
                    >
                        登录
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
