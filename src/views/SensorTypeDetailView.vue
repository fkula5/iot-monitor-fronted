<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import EditSensorType from "@/components/sensortype/EditSensorType.vue";
import { api, config, type SensorType } from "@/lib/api";
import PageHeader from "@/components/shared/PageHeader.vue";
import { toast } from "vue-sonner";

const route = useRoute();
const router = useRouter();
const sensorTypeId = Number(route.params.id);

const sensorType = ref<SensorType | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isEditOpen = ref(false);

async function fetchSensorType() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await api.get<SensorType>(
      config.endpoints.sensorType(sensorTypeId),
    );
    sensorType.value = data;
    console.log("Fetched sensor type:", data);
  } catch (err) {
    error.value = "Nie udało się załadować typu sensora.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchSensorType();
});

const handleUpdate = (updatedSensorType: SensorType) => {
  sensorType.value = updatedSensorType;
  api
    .put(config.endpoints.sensorType(sensorTypeId), updatedSensorType)
    .then(() => {
      toast.success("Typ sensora został zaktualizowany.");
    })
    .catch(() => {
      error.value = "Nie udało się zaktualizować typu sensora.";
    })
    .finally(() => {
      isEditOpen.value = false;
      fetchSensorType();
    });
};

const handleDelete = () => {
  if (confirm("Czy na pewno chcesz usunąć ten typ sensora?")) {
    isLoading.value = true;
    error.value = null;
    api
      .delete(config.endpoints.sensorType(sensorTypeId))
      .then(() => {
        toast.success("Typ sensora został usunięty.");
      })
      .catch(() => {
        error.value = "Nie udało się usunąć typu sensora.";
      })
      .finally(() => {
        isLoading.value = false;
        router.push("/panel/sensor-types");
      });
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="sensorType?.name || 'Szczegóły typu sensora'"
      :description="
        sensorType?.model || 'Szczegółowe parametry techniczne urządzenia'
      "
    >
      <template #actions>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="router.back()">
            <ArrowLeft class="mr-2 h-4 w-4" /> Powrót
          </Button>
          <Button size="sm" @click="isEditOpen = true" :disabled="!sensorType">
            <Pencil class="mr-2 h-4 w-4" /> Edytuj
          </Button>
          <Button
            variant="destructive"
            size="sm"
            @click="handleDelete"
            :disabled="!sensorType"
          >
            <Trash2 class="mr-2 h-4 w-4" /> Usuń
          </Button>
        </div>
      </template>
    </PageHeader>

    <div v-if="sensorType" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div class="space-y-1">
              <p
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Model
              </p>
              <p class="font-semibold">{{ sensorType.model }}</p>
            </div>
            <div class="space-y-1">
              <p
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Producent
              </p>
              <p class="font-semibold">
                {{ sensorType.manufacturer || "Nieokreślony" }}
              </p>
            </div>
            <div class="space-y-1">
              <p
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Jednostka miary
              </p>
              <Badge variant="secondary" class="font-mono">{{
                sensorType.unit
              }}</Badge>
            </div>
            <div class="space-y-1">
              <p
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                ID Systemowe
              </p>
              <code class="text-xs bg-muted px-1 py-0.5 rounded">{{
                sensorType.id
              }}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zakresy pracy</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-sm text-muted-foreground">Minimum</span>
            <span class="font-bold text-lg">
              {{ sensorType.min_value ?? "—" }}
              <small class="text-muted-foreground font-normal">{{
                sensorType.unit
              }}</small>
            </span>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-sm text-muted-foreground">Maximum</span>
            <span class="font-bold text-lg">
              {{ sensorType.max_value ?? "—" }}
              <small class="text-muted-foreground font-normal">{{
                sensorType.unit
              }}</small>
            </span>
          </div>
          <div class="pt-2">
            <p class="text-xs font-medium text-muted-foreground uppercase mb-2">
              Opis urządzenia
            </p>
            <p class="text-sm leading-relaxed text-balance italic">
              "{{
                sensorType.description || "Brak opisu dla tego typu sensora."
              }}"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else-if="isLoading" class="grid gap-6 md:grid-cols-2">
      <Card v-for="i in 2" :key="i" class="h-48 animate-pulse bg-muted/50" />
    </div>

    <EditSensorType
      v-if="sensorType"
      v-model:isOpen="isEditOpen"
      :sensorType="sensorType"
      @updateSensorType="handleUpdate"
    />
  </div>
</template>
