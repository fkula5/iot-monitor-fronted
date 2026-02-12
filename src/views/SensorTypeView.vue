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
import AddSensorType from "@/components/AddSensorType.vue";
import SearchFilterBar from "@/components/shared/SearchFilterBar.vue";
import EditSensorType from "@/components/sensortypes/EditSensorType.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import { toast } from "vue-sonner";

const sensorTypes = ref<SensorType[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref("");
const isAddSensorTypeDialogOpen = ref(false);
const isEditSensorTypeDialogOpen = ref(false);
const selectedSensorType = ref<SensorType | null>(null);

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

function openEditDialog(sensorType: SensorType) {
  selectedSensorType.value = sensorType;
  isEditSensorTypeDialogOpen.value = true;
}

async function handleAddSensorType(newSensorType: { name: string }) {
  isLoading.value = true;
  error.value = null;

  try {
    await api.post(config.endpoints.sensorTypes, newSensorType);
    isAddSensorTypeDialogOpen.value = false;
    selectedSensorType.value = null;
    await fetchSensorTypes();
  } catch (err) {
    error.value =
      err instanceof ApiError
        ? err.message
        : "Nie udało się dodać nowego typu sensora.";
  } finally {
    toast.success("Nowy typ sensora został dodany!");
    isLoading.value = false;
  }
}

async function handlerEditSensorType(updatedData: SensorType) {
  isLoading.value = true;
  error.value = null;
  selectedSensorType.value = null;

  try {
    await api.put(
      `${config.endpoints.sensorType(updatedData.id)}`,
      updatedData,
    );
    isEditSensorTypeDialogOpen.value = false;
    await fetchSensorTypes();
  } catch (err) {
    error.value =
      err instanceof ApiError
        ? err.message
        : "Nie udało się zaktualizować typu sensora.";
  } finally {
    toast.success("Typ sensora został zaktualizowany!");
    isLoading.value = false;
  }
}

async function handleDeleteSensorType(id: number) {
  if (!confirm("Czy na pewno chcesz usunąć ten typ sensora?")) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await api.delete(config.endpoints.sensorType(id));
    await fetchSensorTypes();
  } catch (err) {
    error.value =
      err instanceof ApiError
        ? err.message
        : "Nie udało się usunąć typu sensora.";
  } finally {
    isLoading.value = false;
    toast.success("Typ sensora został usunięty!");
  }
}

onMounted(fetchSensorTypes);

const filteredSensorTypes = computed(() => {
  if (!searchTerm.value) return sensorTypes.value;

  const query = searchTerm.value.toLowerCase();
  return sensorTypes.value.filter(
    (type) =>
      type.name.toLowerCase().includes(query) ||
      type.model.toLowerCase().includes(query) ||
      type.manufacturer?.toLowerCase().includes(query),
  );
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
          <SearchFilterBar
            v-model="searchTerm"
            placeholder="Szukaj typów..."
            :is-loading="isLoading"
            add-label="Dodaj typ sensora"
            @refresh="fetchSensorTypes"
            @add="isAddSensorTypeDialogOpen = true"
          />
        </div>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton v-if="isLoading" type="table" :count="5" />

        <EmptyState
          v-else-if="filteredSensorTypes.length === 0"
          :title="searchTerm ? 'Brak wyników' : 'Brak typów sensorów'"
          :description="
            searchTerm
              ? 'Nie znaleziono typów sensorów spełniających kryteria wyszukiwania.'
              : 'Nie znaleziono żadnych typów sensorów. Dodaj nowy typ, aby zacząć.'
          "
          :icon="Activity"
          :show-card="false"
        >
          <template v-if="!searchTerm"></template>
        </EmptyState>

        <template v-else>
          <SensorTypesTable
            :sensor-types="filteredSensorTypes"
            @edit="openEditDialog"
            @delete="handleDeleteSensorType"
          />
          <div class="mt-4 text-sm text-gray-600 text-center">
            Wyświetlono {{ filteredSensorTypes.length }} z
            {{ sensorTypes.length }} typów sensorów.
          </div>
        </template>
      </CardContent>
    </Card>

    <AddSensorType
      :is-open="isAddSensorTypeDialogOpen"
      @update:is-open="isAddSensorTypeDialogOpen = $event"
      @add-sensor-type="handleAddSensorType"
    />

    <EditSensorType
      v-if="selectedSensorType"
      :is-open="isEditSensorTypeDialogOpen"
      :sensor-type="selectedSensorType"
      @update:is-open="isEditSensorTypeDialogOpen = $event"
      @update-sensor-type="handlerEditSensorType"
    />
  </div>
</template>
