import axios from "axios";

// 创建 axios 实例
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Auth Store - 简单的认证状态管理
export const authStore = {
    getToken(): string | null {
        return localStorage.getItem("token");
    },

    setToken(token: string) {
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    removeToken() {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};

// 请求拦截器 - 自动添加 token
api.interceptors.request.use(
    (config) => {
        const token = authStore.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理 401 错误
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authStore.removeToken();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// 初始化 - 从 localStorage 恢复 token
const token = authStore.getToken();
if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
