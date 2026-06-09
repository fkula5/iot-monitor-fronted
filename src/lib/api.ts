const isSecure = window.location.protocol === "https:";
const currentHost = window.location.host;

const API_URL =
  import.meta.env.VITE_API_URL || `${window.location.protocol}//${currentHost}`;
const WS_URL =
  import.meta.env.VITE_WS_URL || `${isSecure ? "wss:" : "ws:"}//${currentHost}`;

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export const config = {
  apiUrl: API_URL,
  wsUrl: WS_URL,
  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    user: "/auth/user",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",

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

export interface PaginatedResponse {
  total_count: number;
  page: number;
  limit: number;
}

export interface PaginatedAlertResponse extends PaginatedResponse {
  alerts: Alert[];
}

export interface PaginatedAlertRuleResponse extends PaginatedResponse {
  alert_rules: AlertRule[];
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
  async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (response.status === 401) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {};
      }
      
      throw new ApiError(
        response.status,
        errorData.message || `${method} ${endpoint} failed: ${response.statusText}`,
        errorData,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  },

  post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>("POST", endpoint, body, options);
  },

  put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>("PUT", endpoint, body, options);
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  },

  auth: {
    forgotPassword(email: string) {
      return api.post(config.endpoints.forgotPassword, { email });
    },
    resetPassword(token: string, password: string) {
      return api.post(config.endpoints.resetPassword, { token, password });
    },
  },
};

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
