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
} from "lucide-vue-next";
import SensorDataChart from "@/components/SensorDataChart.vue";

interface RecentEvent {
  message: string;
  time: string;
}

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
    model?: string;
  };
  created_at: string;
  updated_at: string;
}

interface Reading {
  timestamp: Date;
  value: number;
}

// NEW: Response types matching new backend
interface ReadingUpdate {
  sensor_id: number;
  value: number;
  timestamp: string;
  sensor_name: string;
  location: string;
  unit: string;
}

interface LatestReadingsBatchResponse {
  readings: ReadingUpdate[];
}

const router = useRouter();
const route = useRoute();
const sensorId = computed(() => {
  const id = parseInt(route.params.id as string);
  return isNaN(id) ? 0 : id;
});

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

const recentEvents = ref<RecentEvent[]>([
  {
    message: "Temperatura osiągnęła górny próg ostrzegawczy (24.8°C).",
    time: "10 minut temu",
  },
  { message: "Wrócono do normalnych warunków pracy.", time: "5 minut temu" },
  { message: "Zaktualizowano oprogramowanie do v2.4.1.", time: "1 dzień temu" },
  { message: "Poziom wilgotności przekroczył 80% RH.", time: "2 dni temu" },
  {
    message: "Pomyślnie przeprowadzono automatyczny test diagnostyczny.",
    time: "3 dni temu",
  },
  { message: "Sensor został zrestartowany zdalnie.", time: "1 tydzień temu" },
]);

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("pl-PL");
}

function parseTimestamp(input: any): Date {
  if (!input) return new Date(NaN);

  const num = Number(input);
  if (!isNaN(num)) {
    return num < 10000000000 ? new Date(num * 1000) : new Date(num);
  }

  return new Date(input);
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

async function fetchHistory() {
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
      const errorText = await response.text();
      console.error("Server error:", response.status, errorText);
      return;
    }

    const data = await response.json();

    console.log("Raw API Response:", data);

    const items = Array.isArray(data) ? data : data.readings || [];

    const formattedReadings = items
      .map((item: ReadingUpdate) => {
        const val = parseFloat(item.value.toString());
        const date = parseTimestamp(item.timestamp);
        return {
          timestamp: date,
          value: val,
        };
      })
      .filter((r: Reading) => !isNaN(r.timestamp.getTime()) && !isNaN(r.value))
      .sort(
        (a: Reading, b: Reading) =>
          a.timestamp.getTime() - b.timestamp.getTime()
      );

    readings.value = formattedReadings;

    if (readings.value.length > 0) {
      latestReading.value = readings.value[readings.value.length - 1] || null;
    }
  } catch (err) {
    console.error("Failed to fetch history", err);
  }
}

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
  if (!sensorId.value) return;

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

        if (data.sensor_id == sensorId.value) {
          const reading: Reading = {
            timestamp: parseTimestamp(data.timestamp),
            value: parseFloat(data.value),
          };

          if (isNaN(reading.timestamp.getTime()) || isNaN(reading.value)) {
            console.warn("Received invalid WS reading:", data);
            return;
          }

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
      if (connectionStatus.value !== "disconnected") {
        connectionStatus.value = "disconnected";
      }
      isConnecting.value = false;

      setTimeout(() => {
        if (!ws.value || ws.value.readyState === WebSocket.CLOSED) {
          if (sensor.value) connectWebSocket();
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
    connectionStatus.value = "disconnected";
    ws.value.close();
    ws.value = null;
  }
}

onMounted(async () => {
  if (sensorId.value) {
    await fetchSensor();
    if (sensor.value) {
      await fetchHistory();
      connectWebSocket();
    }
  } else {
    error.value = "Nieprawidłowe ID sensora";
    isLoading.value = false;
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
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Aktualny odczyt</p>
                <p class="text-2xl mt-1">
                  {{ latestReading ? latestReading.value.toFixed(2) : "---" }}
                  <span class="text-lg text-muted-foreground ml-1">
                    {{ sensor.sensor_type.unit }}
                  </span>
                </p>
              </div>
              <Activity class="h-8 w-8 text-blue-600" />
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
              Odczyty
            </CardDescription>
            <CardTitle class="text-3xl">
              {{ readingStats?.count || 0 }}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="shadow-lg">
          <CardHeader>
            <CardTitle class="text-xl">Informacje o Sensorze</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-start gap-3">
              <Package class="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm text-gray-600">Typ Sensora</p>
                <p class="font-medium text-gray-800">
                  {{ sensor.sensor_type.model }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <MapPin class="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm text-gray-600">Lokalizacja Instalacji</p>
                <p class="font-medium text-gray-800">{{ sensor.location }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Calendar class="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm text-gray-600">Data Instalacji</p>
                <p class="font-medium text-gray-800">
                  {{ formatDate(sensor.created_at) }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Clock class="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm text-gray-600">Ostatnia Kalibracja</p>
                <p class="font-medium text-gray-800">
                  {{ formatDate(sensor.created_at) }}
                </p>
              </div>
            </div>

            <div
              v-if="sensor.description"
              class="pt-4 border-t border-gray-200"
            >
              <p class="text-sm text-gray-600 mb-1">Opis</p>
              <p class="text-sm italic text-gray-700">
                {{ sensor.description }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="shadow-lg">
          <CardHeader>
            <CardTitle class="text-xl">Ostatnie Wydarzenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="(event, index) in recentEvents"
                :key="index"
                class="flex gap-3 items-start"
              >
                <div
                  class="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"
                ></div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ event.message }}</p>
                  <p class="text-xs text-gray-500">{{ event.time }}</p>
                </div>
              </div>

              <div
                v-if="recentEvents.length === 0"
                class="text-center text-gray-500 py-4"
              >
                Brak ostatnich wydarzeń do wyświetlenia.
              </div>
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
