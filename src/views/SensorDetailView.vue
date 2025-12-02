<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Clock,
  MapPin,
  RefreshCw,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
} from "lucide-vue-next";
import SensorDataChart from "@/components/SensorDataChart.vue";

interface SensorType {
  id: number;
  name: string;
  unit: string;
  min_value: number;
  max_value: number;
  model?: string;
  manufacturer?: string;
}

interface SensorData {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  active: boolean;
  sensor_type: SensorType;
  created_at: string;
  updated_at: string;
}

interface Reading {
  timestamp: Date;
  value: number;
}

interface ReadingUpdate {
  sensor_id: number;
  value: number;
  timestamp: string;
  sensor_name: string;
  location: string;
  unit: string;
}

type ConnectionStatus = "connected" | "disconnected" | "error";
type Trend = "up" | "down" | "stable";

interface ReadingStats {
  min: string;
  max: string;
  avg: string;
  count: number;
  trend: Trend;
}

const router = useRouter();
const route = useRoute();
const sensorId = computed<number>(() => {
  const id = parseInt(route.params.id as string);
  return isNaN(id) ? 0 : id;
});

const sensor = ref<SensorData | null>(null);
const readings = ref<Reading[]>([]);
const latestReading = ref<Reading | null>(null);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

const ws = ref<WebSocket | null>(null);
const isConnecting = ref<boolean>(false);
const connectionStatus = ref<ConnectionStatus>("disconnected");
const reconnectAttempts = ref<number>(0);
const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_READINGS = 50;

function parseTimestamp(input: any): Date {
  if (!input) return new Date(NaN);

  const num = Number(input);
  if (!isNaN(num)) {
    return num < 10000000000 ? new Date(num * 1000) : new Date(num);
  }

  return new Date(input);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s temu`;
  if (diffMin < 60) return `${diffMin}m temu`;
  if (diffHour < 24) return `${diffHour}h temu`;
  return `${diffDay}d temu`;
}

const readingStats = computed<ReadingStats | null>(() => {
  if (readings.value.length === 0) return null;

  const values = readings.value.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  let trend: Trend = "stable";

  if (readings.value.length >= 20) {
    const recent = readings.value.slice(-10);
    const previous = readings.value.slice(-20, -10);
    const recentAvg = recent.reduce((a, b) => a + b.value, 0) / recent.length;
    const prevAvg = previous.reduce((a, b) => a + b.value, 0) / previous.length;
    const diff = recentAvg - prevAvg;
    if (Math.abs(diff) > (max - min) * 0.05) {
      trend = diff > 0 ? "up" : "down";
    }
  }

  return {
    min: min.toFixed(2),
    max: max.toFixed(2),
    avg: avg.toFixed(2),
    count: readings.value.length,
    trend,
  };
});

const isValueInRange = computed<boolean>(() => {
  if (!latestReading.value || !sensor.value) return true;
  const val = latestReading.value.value;
  const { min_value, max_value } = sensor.value.sensor_type;
  return val >= min_value && val <= max_value;
});

async function fetchSensor(): Promise<void> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    error.value = "Nie jesteś zalogowany";
    router.push("/login");
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const response = await fetch(
      `http://localhost:8080/api/sensors/${sensorId.value}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(`Błąd serwera: ${response.status}`);
    }

    sensor.value = await response.json();
  } catch (err: any) {
    console.error("Fetch sensor error:", err);
    error.value = err.message || "Nie udało się pobrać danych sensora";
  } finally {
    isLoading.value = false;
  }
}

async function fetchHistory(): Promise<void> {
  if (!sensorId.value) return;

  try {
    const params = new URLSearchParams({
      limit: MAX_READINGS.toString(),
    });

    const response = await fetch(
      `http://localhost:8080/api/data/sensors/${
        sensorId.value
      }/latest?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      console.error("History fetch failed:", response.status);
      return;
    }

    const data = await response.json();
    const items: ReadingUpdate[] = Array.isArray(data)
      ? data
      : data.readings || [];

    const formattedReadings: Reading[] = items
      .map((item: ReadingUpdate): Reading | null => {
        const timestamp = parseTimestamp(item.timestamp);
        const value = parseFloat(item.value.toString());

        if (isNaN(timestamp.getTime()) || isNaN(value)) {
          return null;
        }

        return { timestamp, value };
      })
      .filter((r): r is Reading => r !== null)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    readings.value = formattedReadings;

    if (readings.value.length > 0) {
      const lastIndex = readings.value.length - 1;
      const lastReading = readings.value[lastIndex];
      latestReading.value = lastReading !== undefined ? lastReading : null;
    } else {
      latestReading.value = null;
    }
  } catch (err) {
    console.error("Failed to fetch history:", err);
  }
}

function connectWebSocket(): void {
  if (ws.value?.readyState === WebSocket.OPEN) return;
  if (!sensorId.value) return;
  if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
    error.value = "Przekroczono maksymalną liczbę prób połączenia";
    return;
  }

  isConnecting.value = true;
  connectionStatus.value = "disconnected";

  try {
    const wsUrl = `ws://localhost:8080/api/data/ws/readings?sensor_ids=${sensorId.value}`;
    ws.value = new WebSocket(wsUrl);

    ws.value.onopen = () => {
      console.log("✓ WebSocket connected");
      connectionStatus.value = "connected";
      isConnecting.value = false;
      reconnectAttempts.value = 0;
      error.value = null;
    };

    ws.value.onmessage = (event: MessageEvent) => {
      try {
        const data: ReadingUpdate = JSON.parse(event.data);

        if (data.sensor_id == sensorId.value) {
          const timestamp = parseTimestamp(data.timestamp);
          const value = parseFloat(data.value.toString());

          if (isNaN(timestamp.getTime()) || isNaN(value)) {
            console.warn("Invalid reading received:", data);
            return;
          }

          const reading: Reading = { timestamp, value };
          latestReading.value = reading;
          readings.value.push(reading);

          if (readings.value.length > MAX_READINGS) {
            readings.value.shift();
          }
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    ws.value.onerror = (err: Event) => {
      console.error("WebSocket error:", err);
      connectionStatus.value = "error";
      isConnecting.value = false;
    };

    ws.value.onclose = (event: CloseEvent) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      connectionStatus.value = "disconnected";
      isConnecting.value = false;

      if (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS && sensor.value) {
        reconnectAttempts.value++;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.value),
          30000
        );
        console.log(
          `Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value}/${MAX_RECONNECT_ATTEMPTS})`
        );

        setTimeout(() => {
          if (!ws.value || ws.value.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, delay);
      }
    };
  } catch (err) {
    console.error("Failed to create WebSocket:", err);
    connectionStatus.value = "error";
    isConnecting.value = false;
  }
}

function disconnectWebSocket(): void {
  if (ws.value) {
    connectionStatus.value = "disconnected";
    ws.value.close();
    ws.value = null;
  }
  reconnectAttempts.value = 0;
}

function manualReconnect(): void {
  disconnectWebSocket();
  reconnectAttempts.value = 0;
  connectWebSocket();
}

onMounted(async () => {
  if (!sensorId.value) {
    error.value = "Nieprawidłowe ID sensora";
    isLoading.value = false;
    return;
  }

  await fetchSensor();

  if (sensor.value) {
    await fetchHistory();
    connectWebSocket();
  }
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button
          @click="router.push('/panel/sensors')"
          variant="ghost"
          size="sm"
        >
          <ArrowLeft class="h-4 w-4 mr-2" />
          Powrót
        </Button>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ sensor?.name || "Sensor" }}
          </h1>
          <p class="text-muted-foreground mt-1">
            {{ sensor?.sensor_type.name }} - Dane w czasie rzeczywistym
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Badge
          :variant="
            connectionStatus === 'connected'
              ? 'default'
              : connectionStatus === 'error'
              ? 'destructive'
              : 'secondary'
          "
        >
          <component
            :is="connectionStatus === 'connected' ? Wifi : WifiOff"
            :class="[
              'h-3 w-3 mr-1',
              connectionStatus === 'connected' && 'animate-pulse',
            ]"
          />
          {{
            connectionStatus === "connected"
              ? "Połączono"
              : connectionStatus === "error"
              ? "Błąd"
              : "Rozłączono"
          }}
        </Badge>

        <Button
          @click="manualReconnect"
          variant="outline"
          size="sm"
          :disabled="isConnecting || connectionStatus === 'connected'"
        >
          <RefreshCw
            :class="['h-4 w-4 mr-2', isConnecting && 'animate-spin']"
          />
          Połącz ponownie
        </Button>
      </div>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="isLoading" class="grid gap-4 md:grid-cols-4">
      <Card v-for="i in 4" :key="i" class="animate-pulse">
        <CardHeader class="pb-3">
          <div class="h-4 bg-muted rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div class="h-8 bg-muted rounded w-16"></div>
        </CardContent>
      </Card>
    </div>

    <div v-else-if="sensor" class="space-y-6">
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Aktualny odczyt</p>
                <div class="flex items-baseline gap-2 mt-1">
                  <p class="text-3xl font-bold">
                    {{ latestReading ? latestReading.value.toFixed(2) : "---" }}
                  </p>
                  <span class="text-lg text-muted-foreground">
                    {{ sensor.sensor_type.unit }}
                  </span>
                </div>
                <p
                  v-if="latestReading"
                  class="text-xs text-muted-foreground mt-1"
                >
                  {{ formatRelativeTime(latestReading.timestamp) }}
                </p>
              </div>
              <div
                :class="[
                  'p-3 rounded-lg',
                  isValueInRange
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30',
                ]"
              >
                <Activity
                  :class="[
                    'h-6 w-6',
                    isValueInRange ? 'text-green-600' : 'text-red-600',
                  ]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardDescription class="flex items-center gap-2">
              <Activity class="h-4 w-4" />
              Średnia
            </CardDescription>
            <CardTitle class="text-3xl">
              {{ readingStats?.avg || "---" }}
              <span class="text-lg text-muted-foreground ml-1">
                {{ sensor.sensor_type.unit }}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Min / Max</CardDescription>
            <CardTitle class="text-2xl">
              {{ readingStats?.min || "---" }} /
              {{ readingStats?.max || "---" }}
              <span class="text-sm text-muted-foreground ml-1">
                {{ sensor.sensor_type.unit }}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardDescription class="flex items-center gap-2">
              <Clock class="h-4 w-4" />
              Trend
            </CardDescription>
            <CardTitle class="text-3xl flex items-center gap-2">
              {{ readingStats?.count || 0 }}
              <component
                v-if="readingStats?.trend && readingStats.trend !== 'stable'"
                :is="readingStats.trend === 'up' ? TrendingUp : TrendingDown"
                :class="[
                  'h-6 w-6',
                  readingStats.trend === 'up'
                    ? 'text-red-600'
                    : 'text-blue-600',
                ]"
              />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card class="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informacje</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-start gap-3">
              <Package
                class="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-muted-foreground">Model</p>
                <p class="font-medium truncate">
                  {{ sensor.sensor_type.model || sensor.sensor_type.name }}
                </p>
                <p
                  v-if="sensor.sensor_type.manufacturer"
                  class="text-xs text-muted-foreground"
                >
                  {{ sensor.sensor_type.manufacturer }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <MapPin
                class="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-muted-foreground">Lokalizacja</p>
                <p class="font-medium">
                  {{ sensor.location || "Nie określono" }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Calendar
                class="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-muted-foreground">Utworzono</p>
                <p class="font-medium text-sm">
                  {{ formatDate(sensor.created_at) }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Activity
                class="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-muted-foreground">Zakres</p>
                <p class="font-medium">
                  {{ sensor.sensor_type.min_value }} -
                  {{ sensor.sensor_type.max_value }}
                  {{ sensor.sensor_type.unit }}
                </p>
              </div>
            </div>

            <div v-if="sensor.description" class="pt-4 border-t">
              <p class="text-sm text-muted-foreground mb-1">Opis</p>
              <p class="text-sm">{{ sensor.description }}</p>
            </div>
          </CardContent>
        </Card>

        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wykres w czasie rzeczywistym</CardTitle>
            <CardDescription>
              Ostatnie {{ MAX_READINGS }} odczytów
              <span v-if="readingStats" class="ml-2">
                ({{ readingStats.count }} wartości)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              v-if="readings.length === 0"
              class="flex items-center justify-center h-64 text-muted-foreground"
            >
              <div class="text-center">
                <Activity class="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Oczekiwanie na dane...</p>
              </div>
            </div>
            <SensorDataChart
              v-else
              class="h-80"
              :chartData="readings"
              :sensorInfo="{
                name: sensor.sensor_type.name,
                unit: sensor.sensor_type.unit,
              }"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
