import { api } from "./client";
import {
    CurrentUser,
    LoginPayload,
    LoginResponse,
    ReservationPayload,
    SshKeyPayload,
} from "./types";

export const login = (payload: LoginPayload) => {
    const form = new URLSearchParams();
    form.set("username", payload.username);
    form.set("password", payload.password);
    return api.post<LoginResponse>("/api/v1/auth/login", form, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

export const getCurrentUser = () => api.get<CurrentUser>("/api/v1/users/me");

export const getNodes = () => api.get("/api/v1/nodes");

export const getNode = (id: number) => api.get(`/api/v1/nodes/${id}`);

export const getReservations = () => api.get("/api/v1/reservations");

export const getMyReservations = () => api.get("/api/v1/reservations/my");

export const createReservation = (payload: ReservationPayload) =>
    api.post("/api/v1/reservations", payload);

export const deleteReservation = (id: number) =>
    api.delete(`/api/v1/reservations/${id}`);

// 修正路径：/me/keys -> /me/ssh-keys
export const getKeys = () => api.get("/api/v1/users/me/ssh-keys");

export const createKey = (payload: SshKeyPayload) =>
    api.post("/api/v1/users/me/ssh-keys", payload);

export const deleteKey = (id: number) =>
    api.delete(`/api/v1/users/me/ssh-keys/${id}`);
