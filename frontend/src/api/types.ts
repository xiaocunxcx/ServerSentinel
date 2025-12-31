export type LoginPayload = {
    username: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    token_type: string;
};

export type CurrentUser = {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    is_active: boolean;
};

export type SshKeyPayload = {
    name?: string;
    public_key: string;
};

export type ReservationPayload = {
    node_id: number;
    start_time: string;
    end_time: string;
    type: "host" | "device";
    device_ids?: number[];
};
