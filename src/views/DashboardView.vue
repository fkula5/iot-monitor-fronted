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

import PageHeader from "@/components/shared/PageHeader.vue";
import StatCard from "@/components/shared/StatCard.vue";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton.vue";
import EmptyState from "@/components/shared/EmptyState.vue";

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
    <PageHeader
      title="Panel Główny"
      description="Przegląd systemu monitorowania IoT"
    >
      <template #actions>
        <Button
          @click="fetchSensors"
          variant="outline"
          :disabled="isLoading"
          class="gap-2"
        >
          <RefreshCw :class="['h-4 w-4', isLoading && 'animate-spin']" />
          Odśwież
        </Button>
      </template>
    </PageHeader>

    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <LoadingSkeleton v-if="isLoading && !error" type="stats" />

    <div v-else-if="!error" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Wszystkie Sensory"
        :value="stats.total"
        description="Łączna liczba sensorów"
        :icon="Activity"
        icon-color="bg-blue-50 text-blue-600"
      />
      <StatCard
        title="Aktywne"
        :value="stats.active"
        :description="`${stats.activePercentage}% statusu aktywnego`"
        :icon="CheckCircle"
        icon-color="bg-green-50 text-green-600"
        value-color="text-green-600"
      />
      <StatCard
        title="Nieaktywne"
        :value="stats.inactive"
        description="Wymagają uwagi"
        :icon="XCircle"
        icon-color="bg-red-50 text-red-600"
        value-color="text-red-600"
      />
      <StatCard
        title="Typy Urządzeń"
        :value="sensorsByType.size"
        description="Różnych kategorii"
        :icon="AlertTriangle"
        icon-color="bg-purple-50 text-purple-600"
      />
    </div>

    <div v-if="!error && !isLoading" class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="text-gray-900">Ostatnia Aktywność</CardTitle>
          <CardDescription>
            Najnowsze zmiany w systemie monitorowania
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-if="sensors.length === 0"
              class="text-sm text-gray-500 text-center py-8"
            >
              Brak aktywności do wyświetlenia
            </div>
            <div
              v-else
              v-for="sensor in sensors.slice(0, 5)"
              :key="sensor.id"
              class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                :class="[
                  'h-2 w-2 rounded-full',
                  sensor.active ? 'bg-green-500' : 'bg-red-500',
                ]"
              />
              <div class="flex-1 space-y-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ sensor.name }}
                </p>
                <p class="text-xs text-gray-500">
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

      <Card>
        <CardHeader>
          <CardTitle class="text-gray-900">Szybkie Akcje</CardTitle>
          <CardDescription>Często używane funkcje systemu</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Button
            @click="navigateToSensors"
            variant="outline"
            class="w-full justify-start gap-2"
          >
            <Activity class="h-4 w-4" />
            Zarządzaj Sensorami
          </Button>
          <Button
            @click="router.push('/panel/alerts')"
            variant="outline"
            class="w-full justify-start gap-2"
          >
            <AlertCircle class="h-4 w-4" />
            Przeglądaj Alerty
          </Button>
          <Button
            @click="fetchSensors"
            variant="outline"
            class="w-full justify-start gap-2"
          >
            <RefreshCw class="h-4 w-4" />
            Odśwież Dane
          </Button>
        </CardContent>
      </Card>
    </div>

    <EmptyState
      v-if="!error && !isLoading && sensors.length === 0"
      :icon="Activity"
      title="Witaj w systemie IoT Monitor!"
      description="Rozpocznij konfigurację swojego systemu monitorowania"
      :show-card="true"
    >
      <template #default>
        <div class="flex gap-3 justify-center mt-4">
          <Button @click="navigateToSensors">Przejdź do Sensorów</Button>
          <Button variant="outline" @click="fetchSensors">Odśwież Listę</Button>
        </div>
      </template>
    </EmptyState>
  </div>
</template>
