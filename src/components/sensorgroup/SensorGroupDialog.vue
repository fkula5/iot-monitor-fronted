<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Sensor {
  id: number;
  name: string;
  location: string | null;
  sensor_type: {
    name: string;
  };
}

interface SensorGroup {
  id?: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  sensor_ids: number[];
}

interface Props {
  isOpen: boolean;
  group?: SensorGroup | null;
  sensors: Sensor[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "save", group: SensorGroup): void;
}>();

const formData = ref<SensorGroup>({
  name: "",
  description: "",
  color: "#3B82F6",
  icon: "folder",
  sensor_ids: [],
});

const colorOptions = [
  { name: "Niebieski", value: "#3B82F6" },
  { name: "Zielony", value: "#10B981" },
  { name: "Czerwony", value: "#EF4444" },
  { name: "Żółty", value: "#F59E0B" },
  { name: "Fioletowy", value: "#8B5CF6" },
  { name: "Różowy", value: "#EC4899" },
];

const iconOptions = [
  { name: "Folder", value: "folder" },
  { name: "Gwiazda", value: "star" },
  { name: "Tag", value: "tag" },
  { name: "Dom", value: "home" },
  { name: "Budynek", value: "building" },
  { name: "Lokalizacja", value: "map-pin" },
];

const isEditMode = computed(() => !!props.group?.id);

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.group) {
      formData.value = { ...props.group };
    } else if (!newVal) {
      setTimeout(resetForm, 300);
    }
  },
);

watch(
  () => props.group,
  (newGroup) => {
    if (newGroup) {
      formData.value = { ...newGroup };
    }
  },
  { deep: true },
);

const resetForm = () => {
  formData.value = {
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "folder",
    sensor_ids: [],
  };
};

const toggleSensor = (sensorId: number) => {
  const id = Number(sensorId);

  if (!formData.value.sensor_ids) {
    formData.value.sensor_ids = [];
  }

  const index = formData.value.sensor_ids.indexOf(id);
  if (index > -1) {
    formData.value.sensor_ids.splice(index, 1);
  } else {
    formData.value.sensor_ids.push(id);
  }
};

const isSensorSelected = (sensorId: number) => {
  if (!formData.value.sensor_ids) return false;
  return formData.value.sensor_ids.includes(Number(sensorId));
};

const handleSubmit = () => {
  if (!formData.value.name) {
    alert("Proszę podać nazwę grupy");
    return;
  }

  emit("save", { ...formData.value });
  emit("update:isOpen", false);
};

const onOpenChange = (open: boolean) => {
  emit("update:isOpen", open);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[600px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>
          {{ isEditMode ? "Edytuj Grupę" : "Utwórz Nową Grupę" }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditMode
              ? "Zaktualizuj informacje o grupie sensorów"
              : "Stwórz nową grupę do organizacji sensorów"
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="name">Nazwa Grupy *</Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="np. Sensory Temperatury"
            required
          />
        </div>

        <div class="space-y-2">
          <Label htmlFor="description">Opis</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Opcjonalny opis grupy"
            :rows="2"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Kolor</Label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="color in colorOptions"
                :key="color.value"
                type="button"
                @click="formData.color = color.value"
                :class="[
                  'h-10 rounded-md border-2 transition-all',
                  formData.color === color.value
                    ? 'border-gray-900 scale-105'
                    : 'border-gray-200 hover:border-gray-400',
                ]"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Ikona</Label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon.value"
                type="button"
                @click="formData.icon = icon.value"
                :class="[
                  'h-10 rounded-md border-2 flex items-center justify-center transition-all',
                  formData.icon === icon.value
                    ? 'border-gray-900 bg-gray-100'
                    : 'border-gray-200 hover:border-gray-400',
                ]"
                :title="icon.name"
              >
                📁
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label>
            Sensory w Grupie
            <Badge variant="secondary" class="ml-2">
              {{ formData.sensor_ids.length }} wybranych
            </Badge>
          </Label>
          <ScrollArea class="h-[200px] border rounded-md p-4">
            <div class="space-y-2">
              <div
                v-for="sensor in sensors"
                :key="sensor.id"
                class="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                @click="toggleSensor(sensor.id)"
              >
                <Checkbox
                  :id="`sensor-${sensor.id}`"
                  :checked="isSensorSelected(sensor.id)"
                />
                <Label
                  :for="`sensor-${sensor.id}`"
                  class="flex-1 cursor-pointer pointer-events-none"
                >
                  <div>
                    <p class="font-medium">{{ sensor.name }}</p>
                    <p class="text-xs text-gray-500">
                      {{ sensor.sensor_type?.name }}
                      <span v-if="sensor.location">
                        • {{ sensor.location }}
                      </span>
                    </p>
                  </div>
                </Label>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <DialogClose as-child>
            <Button type="button" variant="outline"> Anuluj </Button>
          </DialogClose>
          <Button type="submit">
            {{ isEditMode ? "Zapisz Zmiany" : "Utwórz Grupę" }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
