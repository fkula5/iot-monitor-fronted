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
  Gauge,
  Clock,
  MapPin,
  RefreshCw,
} from "lucide-vue-next";
import SensorDataChart from "@/components/SensorDataChart.vue";

const router = useRouter();
const route = useRoute();
const sensorId = computed(() => parseInt(route.params.id as string));

interface SensorData {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  active: boolean;
  sensor_type: {
    id: number;
    name: string;
    unit: string;
    min_value: number;
    max_value: number;
  };
  created_at: string;
  updated_at: string;
}

interface Reading {
  timestamp: Date;
  value: number;
}

const sensor = ref<SensorData | null>(null);
const readings = ref<Reading[]>([]);
const latestReading = ref<Reading | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const ws = ref<WebSocket | null>(null);
const isConnecting = ref(false);
const connectionStatus = ref<"connected" | "disconnected" | "error">(
  "disconnected"
);

const MAX_READINGS = 50;

async function fetchSensor() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    error.value = "Nie jesteś zalogowany";
    router.push("/login");
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch(
      `http://localhost:8080/api/sensors/${sensorId.value}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      router.push("/login");
      return;
    }

    if (!response.ok) {
      throw new Error("Nie udało się pobrać danych sensora");
    }

    sensor.value = await response.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function connectWebSocket() {
  if (ws.value?.readyState === WebSocket.OPEN) return;

  const token = localStorage.getItem("authToken");
  if (!token) return;

  isConnecting.value = true;
  connectionStatus.value = "disconnected";

  try {
    ws.value = new WebSocket(
      `ws://localhost:8080/api/data/ws/readings?sensor_ids=${sensorId.value}`
    );

    ws.value.onopen = () => {
      console.log("WebSocket connected");
      connectionStatus.value = "connected";
      isConnecting.value = false;
    };

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.sensor_id === sensorId.value) {
          const reading: Reading = {
            timestamp: new Date(data.timestamp),
            value: data.value,
          };

          latestReading.value = reading;
          readings.value.push(reading);

          if (readings.value.length > MAX_READINGS) {
            readings.value.shift();
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.value.onerror = (error) => {
      console.error("WebSocket error:", error);
      connectionStatus.value = "error";
      isConnecting.value = false;
    };

    ws.value.onclose = () => {
      console.log("WebSocket disconnected");
      connectionStatus.value = "disconnected";
      isConnecting.value = false;

      setTimeout(() => {
        if (connectionStatus.value === "disconnected") {
          connectWebSocket();
        }
      }, 5000);
    };
  } catch (err) {
    console.error("Failed to create WebSocket:", err);
    connectionStatus.value = "error";
    isConnecting.value = false;
  }
}

function disconnectWebSocket() {
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }
}

const readingStats = computed(() => {
  if (readings.value.length === 0) return null;

  const values = readings.value.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    min: min.toFixed(2),
    max: max.toFixed(2),
    avg: avg.toFixed(2),
    count: readings.value.length,
  };
});

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString("pl-PL");
}

onMounted(async () => {
  await fetchSensor();
  if (sensor.value) {
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
          <p class="text-muted-foreground mt-1">Dane w czasie rzeczywistym</p>
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
          <Activity
            :class="[
              'h-3 w-3 mr-1',
              connectionStatus === 'connected' && 'animate-pulse',
            ]"
          />
          {{
            connectionStatus === "connected"
              ? "Połączono"
              : connectionStatus === "error"
              ? "Błąd połączenia"
              : "Rozłączono"
          }}
        </Badge>
        <Button
          @click="connectWebSocket"
          variant="outline"
          size="sm"
          :disabled="isConnecting || connectionStatus === 'connected'"
        >
          <RefreshCw
            :class="['h-4 w-4 mr-2', isConnecting && 'animate-spin']"
          />
          Połącz
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
          <CardHeader class="pb-3">
            <CardDescription class="flex items-center gap-2">
              <Gauge class="h-4 w-4" />
              Aktualna wartość
            </CardDescription>
            <CardTitle class="text-3xl">
              {{ latestReading ? latestReading.value.toFixed(2) : "---" }}
              <span class="text-lg text-muted-foreground ml-1">
                {{ sensor.sensor_type.unit }}
              </span>
            </CardTitle>
          </CardHeader>
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
              Odczyty
            </CardDescription>
            <CardTitle class="text-3xl">
              {{ readingStats?.count || 0 }}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informacje o sensorze</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Typ:</span>
              <span class="font-medium">{{ sensor.sensor_type.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Jednostka:</span>
              <span class="font-medium">{{ sensor.sensor_type.unit }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Zakres:</span>
              <span class="font-medium">
                {{ sensor.sensor_type.min_value }} -
                {{ sensor.sensor_type.max_value }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Status:</span>
              <Badge :variant="sensor.active ? 'default' : 'destructive'">
                {{ sensor.active ? "Aktywny" : "Nieaktywny" }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Szczegóły</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-start gap-2">
              <MapPin class="h-4 w-4 text-muted-foreground mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-muted-foreground">Lokalizacja</p>
                <p class="font-medium">{{ sensor.location || "Brak" }}</p>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Opis</p>
              <p class="font-medium">{{ sensor.description || "Brak" }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ostatni odczyt</p>
              <p class="font-medium">
                {{
                  latestReading
                    ? formatTimestamp(latestReading.timestamp)
                    : "Brak danych"
                }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Wykres w czasie rzeczywistym</CardTitle>
          <CardDescription>
            Ostatnie {{ MAX_READINGS }} odczytów
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SensorDataChart
            class="max-h-80"
            v-if="sensor"
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
</template>
