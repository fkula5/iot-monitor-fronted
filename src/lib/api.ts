const isSecure = window.location.protocol === "https:";
const currentHost = window.location.host;

const API_URL =
  import.meta.env.VITE_API_URL || `${window.location.protocol}//${currentHost}`;
const WS_URL =
  import.meta.env.VITE_WS_URL || `${isSecure ? "wss:" : "ws:"}//${currentHost}`;

export const config = {
  apiUrl: API_URL,
  wsUrl: WS_URL,
  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    user: "/auth/user",

    sensors: "/api/sensors",
    sensor: (id: number) => `/api/sensors/${id}`,
    sensorTypes: "/api/sensor-types",
    sensorType: (id: number) => `/api/sensor-types/${id}`,
    sensorGroups: "/api/sensor-groups",
    sensorGroup: (id: number) => `/api/sensor-groups/${id}`,

    sensorLatest: (id: number) => `/api/data/sensors/${id}/latest`,
    wsReadings: (sensorIds: number[]) =>
      `/api/data/ws/readings?sensor_ids=${sensorIds.join(",")}`,

    alertRules: "/api/alert-rules",
    alertRule: (id: number) => `/api/alert-rules/${id}`,
    alerts: "/api/alerts",
    alertRead: (id: number) => `/api/alerts/${id}/read`,
  },
} as const;

export interface SensorType {
  id: number;
  name: string;
  unit: string;
  min_value: number;
  max_value: number;
  model: string;
  manufacturer?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Sensor {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  active: boolean;
  sensor_type_id: number;
  sensor_type: SensorType;
  created_at: string;
  updated_at: string;
}

export interface AlertRule {
  id: number;
  sensor_id: number;
  name: string;
  condition_type: "GT" | "LT" | "EQ" | "NEQ" | "GTE" | "LTE";
  threshold: number;
  is_enabled: boolean;
  description?: string;
  sensor?: Sensor;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  rule_id: number;
  sensor_id: number;
  value: number;
  message: string;
  is_read: boolean;
  triggered_at: string;
  sensor?: Sensor;
  rule?: AlertRule;
}

export interface SensorGroup {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  sensor_ids: number[];
  sensors?: Sensor[];
  sensor_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Reading {
  timestamp: Date;
  value: number;
}

export interface ReadingUpdate {
  sensor_id: number;
  value: number;
  timestamp: string;
  sensor_name: string;
  location: string;
  unit: string;
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `GET ${endpoint} failed: ${response.statusText}`,
      );
    }

    return response.json();
  },

  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.message || `POST ${endpoint} failed: ${response.statusText}`,
        error,
      );
    }

    return response.json();
  },

  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.message || `PUT ${endpoint} failed: ${response.statusText}`,
        error,
      );
    }

    return response.json();
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `DELETE ${endpoint} failed: ${response.statusText}`,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private endpoint: string;
  private onMessage: (data: any) => void;
  private onStatusChange: (
    status: "connected" | "disconnected" | "error",
  ) => void;

  constructor(
    endpoint: string,
    onMessage: (data: any) => void,
    onStatusChange: (status: "connected" | "disconnected" | "error") => void,
  ) {
    this.endpoint = endpoint;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const url = `${WS_URL}${this.endpoint}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.onStatusChange("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.onStatusChange("error");
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.onStatusChange("disconnected");
      this.handleReconnect();
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000,
    );

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected");
    }
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface SensorReading {
  sensor_id: number;
  value: number;
  timestamp: string;
  sensor_name: string;
  location: string;
  unit: string;
}

export interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
}
