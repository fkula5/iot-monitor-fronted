<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Activity } from "lucide-vue-next";
import { api, config, ApiError, type SensorType } from "@/lib/api";
import { ref, onMounted, computed } from "vue";

import PageHeader from "@/components/shared/PageHeader.vue";
import StatCard from "@/components/shared/StatCard.vue";
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton.vue";
import SensorTypesTable from "@/components/sensortypes/SensorTypesTable.vue";

const sensorTypes = ref<SensorType[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
async function fetchSensorTypes() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await api.get<SensorType[]>(config.endpoints.sensorTypes);
    sensorTypes.value = data || [];
  } catch (err) {
    error.value =
      err instanceof ApiError
        ? err.message
        : "Nie udało się pobrać danych typów sensorów.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchSensorTypes();
});

const stats = computed(() => ({
  total: sensorTypes.value.length,
  types: new Set(sensorTypes.value.map((type) => type.name)).size,
}));
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Typy sensorów"
      description="Zarządzaj wszystkimi typami czujników w systemie"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Wszystkie typy sensorów"
        :value="stats.total"
        :icon="Activity"
        description="Łączna liczba dostępnych typów sensorów"
        icon-color="bg-blue-50 text-blue-600"
      />
      <StatCard
        title="Aktywne"
        value="4"
        :icon="CheckCircle"
        description="Liczba aktywnym sensorów"
        icon-color="bg-green-50 text-green-600"
        value-color="text-green-600"
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
          <CardTitle>Lista typów dostępnych typów sensorów</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton v-if="isLoading" type="table" :count="5" />

        <template v-else>
          <SensorTypesTable :sensor-types="sensorTypes" />
          <div class="mt-4 text-sm text-gray-600 text-center">
            Wyświetlono {{ sensorTypes.length }} typów sensorów.
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
