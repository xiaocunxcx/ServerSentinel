// ============ Auth Types ============
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
    created_at?: string;
    ssh_keys?: SSHKey[];
};

// ============ SSH Key Types ============
export type SSHKey = {
    id: number;
    public_key: string;
    fingerprint: string;
    user_id: number;
    created_at: string;
};

export type SshKeyPayload = {
    public_key: string;
};

// ============ Node Types ============
export type NodeStatus = "online" | "offline" | "maintenance";

export type Node = {
    id: number;
    name: string;
    ip_address: string;
    ssh_port: number;
    status: NodeStatus;
    created_at: string;
    updated_at: string;
    devices: Device[];
};

// ============ Device Types ============
export type Device = {
    id: number;
    node_id: number;
    device_index: number;
    model_name: string;
    created_at: string;
};

// ============ Reservation Types ============
export type ReservationType = "machine" | "device";

export type Reservation = {
    id: number;
    user_id: number;
    node_id: number;
    start_time: string;
    end_time: string;
    type: ReservationType;
    created_at: string;
    updated_at: string;
    reserved_devices?: Device[];
    user?: CurrentUser;
    node?: Node;
};

export type ReservationPayload = {
    node_id: number;
    start_time: string;
    end_time: string;
    type: ReservationType;
    device_ids?: number[];
};

// ============ Statistics Types ============
export type ClusterStats = {
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    totalDevices: number;
    idleDevices: number;
    reservedDevices: number;
    activeReservations: number;
};
