<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  XCircle,
} from "lucide-vue-next";

const router = useRouter();

interface Sensor {
  id: number;
  name: string;
  location: string | null;
  active: boolean;
  sensor_type_id: number;
}

const sensors = ref<Sensor[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Obliczenia statystyk
const stats = computed(() => {
  const total = sensors.value.length;
  const active = sensors.value.filter((s) => s.active).length;
  const inactive = total - active;

  return {
    total,
    active,
    inactive,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
  };
});

// Sensory pogrupowane według typu
const sensorsByType = computed(() => {
  const grouped = new Map<number, number>();
  sensors.value.forEach((sensor) => {
    const count = grouped.get(sensor.sensor_type_id) || 0;
    grouped.set(sensor.sensor_type_id, count + 1);
  });
  return grouped;
});

async function fetchSensors() {
  isLoading.value = true;
  error.value = null;
  const token = localStorage.getItem("authToken");

  if (!token) {
    error.value = "Nie jesteś zalogowany.";
    isLoading.value = false;
    setTimeout(() => router.push("/login"), 2000);
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/sensors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      error.value = "Sesja wygasła. Proszę zalogować się ponownie.";
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!response.ok) {
      throw new Error(`Błąd pobierania sensorów: ${response.statusText}`);
    }

    const data = await response.json();
    sensors.value = data || [];
  } catch (err: any) {
    console.error("Błąd:", err);
    error.value = err.message || "Nie udało się pobrać danych.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchSensors);

function navigateToSensors() {
  router.push("/panel/sensors");
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Panel Główny</h1>
        <p class="text-muted-foreground mt-1">
          Przegląd systemu monitorowania IoT
        </p>
      </div>
      <Button
        @click="fetchSensors"
        variant="outline"
        size="sm"
        :disabled="isLoading"
      >
        <RefreshCw :class="['h-4 w-4 mr-2', isLoading ? 'animate-spin' : '']" />
        Odśwież
      </Button>
    </div>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Loading State -->
    <div
      v-if="isLoading && !error"
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card v-for="i in 4" :key="i" class="animate-pulse">
        <CardHeader class="pb-3">
          <div class="h-4 bg-muted rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div class="h-8 bg-muted rounded w-16"></div>
        </CardContent>
      </Card>
    </div>

    <!-- Stats Cards -->
    <div v-else-if="!error" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Total Sensors -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Wszystkie Sensory</CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.total }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Łączna liczba sensorów
          </p>
        </CardContent>
      </Card>

      <!-- Active Sensors -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Aktywne</CardTitle>
          <CheckCircle class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ stats.active }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            <span class="text-green-600 font-medium">
              {{ stats.activePercentage }}%
            </span>
            statusu aktywnego
          </p>
        </CardContent>
      </Card>

      <!-- Inactive Sensors -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Nieaktywne</CardTitle>
          <XCircle class="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ stats.inactive }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">Wymagają uwagi</p>
        </CardContent>
      </Card>

      <!-- Types Count -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Alerts</CardTitle>
          <div class="p-2 rounded-lg bg-red-50">
            <AlertTriangle class="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ sensorsByType.size }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Różnych typów urządzeń
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity Card -->
    <div v-if="!error && !isLoading" class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ostatnia Aktywność</CardTitle>
          <CardDescription>
            Najnowsze zmiany w systemie monitorowania
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-if="sensors.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              Brak aktywności do wyświetlenia
            </div>
            <div
              v-else
              v-for="sensor in sensors.slice(0, 5)"
              :key="sensor.id"
              class="flex items-center gap-4"
            >
              <div
                :class="[
                  'h-2 w-2 rounded-full',
                  sensor.active ? 'bg-green-600' : 'bg-red-600',
                ]"
              />
              <div class="flex-1 space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ sensor.name }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ sensor.location || "Brak lokalizacji" }}
                </p>
              </div>
              <Button variant="ghost" size="sm" @click="navigateToSensors">
                Zobacz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Szybkie Akcje</CardTitle>
          <CardDescription> Często używane funkcje systemu </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button
            @click="navigateToSensors"
            variant="outline"
            class="w-full justify-start"
          >
            <Activity class="mr-2 h-4 w-4" />
            Zarządzaj Sensorami
          </Button>
          <Button
            @click="router.push('/panel/alerts')"
            variant="outline"
            class="w-full justify-start"
          >
            <AlertCircle class="mr-2 h-4 w-4" />
            Przeglądaj Alerty
          </Button>
          <Button
            @click="fetchSensors"
            variant="outline"
            class="w-full justify-start"
          >
            <RefreshCw class="mr-2 h-4 w-4" />
            Odśwież Dane
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Welcome Message for New Users -->
    <Card v-if="!error && !isLoading && sensors.length === 0">
      <CardHeader>
        <CardTitle>Witaj w systemie IoT Monitor!</CardTitle>
        <CardDescription>
          Rozpocznij konfigurację swojego systemu monitorowania
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Nie masz jeszcze żadnych sensorów. Skontaktuj się z administratorem,
          aby dodać pierwsze urządzenia do monitorowania.
        </p>
        <div class="flex gap-2">
          <Button @click="navigateToSensors"> Przejdź do Sensorów </Button>
          <Button variant="outline" @click="fetchSensors">
            Odśwież Listę
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
