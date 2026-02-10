<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageHeader from "@/components/shared/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import EditSensorType from "@/components/sensortypes/EditSensorType.vue";
import type { SensorType } from "@/lib/api";
import { int } from "zod/v4";

const route = useRoute();
const router = useRouter();
const sensorTypeId = route.params.id as string;

// Mock Data - Replace with actual API call
const sensorType = ref<SensorType | null>(null);
const isEditOpen = ref(false);

const fetchDetail = async () => {
  // Simulate API call
  setTimeout(() => {
    sensorType.value = {
      id: parseInt(sensorTypeId),
      name: "Sensor Temperatury",
      model: "DS18B20",
      manufacturer: "Maxim Integrated",
      unit: "°C",
      description: "Standardowy cyfrowy czujnik temperatury 1-Wire.",
      min_value: -55,
      max_value: 125,
      created_at: "2023-01-01",
    };
  }, 500);
};

onMounted(() => {
  fetchDetail();
});

const handleUpdate = (updated: SensorType) => {
  sensorType.value = updated;
  // TODO: Send update to API here
  console.log("Updating sensor type:", updated);
};

const handleDelete = () => {
  if (confirm("Czy na pewno chcesz usunąć ten typ sensora?")) {
    console.log("Deleting...");
    router.push("/sensor-types");
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button variant="outline" size="icon" @click="router.back()">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h2 class="text-3xl font-bold tracking-tight" v-if="sensorType">
            {{ sensorType.name }}
          </h2>
          <p class="text-muted-foreground" v-if="sensorType">
            {{ sensorType.model }}
          </p>
          <div v-else class="h-8 w-48 animate-pulse bg-muted rounded"></div>
        </div>
      </div>

      <div class="flex gap-2">
        <Button
          variant="destructive"
          @click="handleDelete"
          :disabled="!sensorType"
        >
          <Trash2 class="mr-2 h-4 w-4" /> Usuń
        </Button>
        <Button @click="isEditOpen = true" :disabled="!sensorType">
          <Pencil class="mr-2 h-4 w-4" /> Edytuj
        </Button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2" v-if="sensorType">
      <Card>
        <CardHeader>
          <CardTitle>Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="text-muted-foreground">Model</div>
            <div class="font-medium">{{ sensorType.model }}</div>

            <div class="text-muted-foreground">Producent</div>
            <div class="font-medium">{{ sensorType.manufacturer || "-" }}</div>

            <div class="text-muted-foreground">Jednostka</div>
            <div>
              <Badge variant="secondary">{{ sensorType.unit }}</Badge>
            </div>

            <div class="text-muted-foreground">ID Systemowe</div>
            <div class="font-mono text-xs">{{ sensorType.id }}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zakres i Opis</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="text-muted-foreground">Zakres Min</div>
            <div class="font-medium">
              {{ sensorType.min_value ?? "Brak" }} {{ sensorType.unit }}
            </div>

            <div class="text-muted-foreground">Zakres Max</div>
            <div class="font-medium">
              {{ sensorType.max_value ?? "Brak" }} {{ sensorType.unit }}
            </div>
          </div>

          <div class="pt-4">
            <div class="text-muted-foreground text-sm mb-1">Opis</div>
            <p class="text-sm">{{ sensorType.description || "Brak opisu." }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <EditSensorType
      v-model:isOpen="isEditOpen"
      :sensorType="sensorType"
      @updateSensorType="handleUpdate"
    />
  </div>
</template>
