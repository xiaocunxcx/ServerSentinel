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

export const getReservations = () => api.get("/api/v1/reservations");

export const createReservation = (payload: ReservationPayload) =>
    api.post("/api/v1/reservations", payload);

export const deleteReservation = (id: number) =>
    api.delete(`/api/v1/reservations/${id}`);

export const getKeys = () => api.get("/api/v1/users/me/keys");

export const createKey = (payload: SshKeyPayload) =>
    api.post("/api/v1/users/me/keys", payload);

export const deleteKey = (id: number) =>
    api.delete(`/api/v1/users/me/keys/${id}`);
