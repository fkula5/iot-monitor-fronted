<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { api, config, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Activity } from "lucide-vue-next";

import PageHeader from "@/components/shared/PageHeader.vue";
import StatCard from "@/components/shared/StatCard.vue";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SearchFilterBar from "@/components/shared/SearchFilterBar.vue";
import SensorsTable from "@/components/sensors/SensorsTable.vue";
import AddSensor from "@/components/AddSensor.vue";

import type { NewSensor } from "@/components/AddSensor.vue";

const router = useRouter();

interface SensorType {
  id: number;
  name: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

interface Sensor {
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

const sensors = ref<Sensor[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref("");
const isAddSensorDialogOpen = ref(false);

async function fetchSensors() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await api.get<Sensor[]>(config.endpoints.sensors);
    sensors.value = data || [];
  } catch (err: any) {
    if (err instanceof ApiError && err.status === 401) {
      localStorage.removeItem("authToken");
      router.push("/login");
    } else {
      error.value = err.message || "Nie udało się pobrać danych sensorów.";
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleAddSensor(newSensor: NewSensor) {
  isLoading.value = true;
  error.value = null;

  try {
    await api.post(config.endpoints.sensors, newSensor);

    isAddSensorDialogOpen.value = false;
    await fetchSensors();
  } catch (err: any) {
    console.error("Błąd dodawania sensora:", err);
    error.value = err.message || "Nie udało się dodać sensora.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchSensors);

const filteredSensors = computed(() => {
  if (!searchTerm.value) return sensors.value;

  const query = searchTerm.value.toLowerCase();
  return sensors.value.filter(
    (sensor) =>
      sensor.name.toLowerCase().includes(query) ||
      sensor.location?.toLowerCase().includes(query) ||
      sensor.sensor_type.name.toLowerCase().includes(query),
  );
});

const stats = computed(() => ({
  total: sensors.value.length,
  active: sensors.value.filter((s) => s.active).length,
  types: new Set(sensors.value.map((s) => s.sensor_type_id)).size,
}));
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Sensory"
      description="Zarządzaj wszystkimi czujnikami w systemie"
    />

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Wszystkie Sensory"
        :value="stats.total"
        :icon="Activity"
        icon-color="bg-blue-50 text-blue-600"
      />
      <StatCard
        title="Aktywne"
        :value="stats.active"
        :icon="CheckCircle"
        icon-color="bg-green-50 text-green-600"
        value-color="text-green-600"
      />
      <StatCard
        title="Typy"
        :value="stats.types"
        :icon="Activity"
        icon-color="bg-purple-50 text-purple-600"
      />
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <CardTitle class="text-gray-900">Lista Sensorów</CardTitle>
          <SearchFilterBar
            v-model="searchTerm"
            placeholder="Szukaj sensorów..."
            :is-loading="isLoading"
            add-label="Dodaj Sensor"
            @refresh="fetchSensors"
            @add="isAddSensorDialogOpen = true"
          />
        </div>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton v-if="isLoading" type="table" :count="5" />

        <EmptyState
          v-else-if="filteredSensors.length === 0"
          :icon="Activity"
          :title="searchTerm ? 'Nie znaleziono sensorów' : 'Brak sensorów'"
          :description="
            searchTerm
              ? 'Spróbuj użyć innych kryteriów wyszukiwania'
              : 'Dodaj pierwszy sensor, aby rozpocząć monitorowanie'
          "
          :show-card="false"
        >
          <template v-if="!searchTerm"> </template>
        </EmptyState>

        <template v-else>
          <SensorsTable :sensors="filteredSensors" />
          <div class="mt-4 text-sm text-gray-600 text-center">
            Wyświetlono {{ filteredSensors.length }} z
            {{ sensors.length }} sensorów
          </div>
        </template>
      </CardContent>
    </Card>

    <AddSensor
      :is-open="isAddSensorDialogOpen"
      @update:is-open="isAddSensorDialogOpen = $event"
      @add-sensor="handleAddSensor"
    />
  </div>
</template>
