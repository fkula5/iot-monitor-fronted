<script setup lang="ts">
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, config, type Sensor, type SensorType } from "@/lib/api";
import { onMounted, ref, watch } from "vue";

interface EditSensorProps {
  isOpen: boolean;
  sensor: Sensor;
}

const isLoading = ref(true);
const error = ref<string | null>(null);
const sensorTypes = ref<SensorType[]>([]);

async function fetchSensorTypes() {
  try {
    isLoading.value = true;
    const data = await api.get<SensorType[]>(config.endpoints.sensorTypes);
    sensorTypes.value = data || [];
  } catch (err: any) {
    error.value = err.message || "Nie udało się pobrać typów sensorów.";
  } finally {
    isLoading.value = false;
  }
}

const props = defineProps<EditSensorProps>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "updateSensor", sensor: Sensor): void;
}>();

const formData = ref({
  name: "",
  type: "",
  location: "",
  description: "",
});

watch(
  () => props.sensor,
  (newSensor) => {
    if (newSensor) {
      formData.value = {
        name: newSensor.name,
        type: newSensor.sensor_type_id.toString(),
        location: newSensor.location || "",
        description: newSensor.description || "",
      };
    }
  },
  { immediate: true },
);

function handleSubmit() {
  const updatedSensor: Sensor = {
    ...props.sensor,
    name: formData.value.name,
    sensor_type_id: parseInt(formData.value.type),
    location: formData.value.location,
    description: formData.value.description,
  };

  emit("updateSensor", updatedSensor);
  emit("update:isOpen", false);
}

const onOpenChange = (open: boolean) => {
  emit("update:isOpen", open);
};

onMounted(fetchSensorTypes);
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent :open="isOpen" @update:open="onOpenChange">
      <DialogHeader>
        <DialogTitle>Edytuj sensor</DialogTitle>
        <DialogDescription>
          Zmień parametry wybranego sensora.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 space-y-2">
            <Label htmlFor="name">Nazwa Sensora *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="np. Sensor Temperatury A1"
              required
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="type">Typ Sensora *</Label>
            <Select v-model="formData.type" required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="type in sensorTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label htmlFor="location">Lokalizacja *</Label>
            <Input
              id="location"
              v-model="formData.location"
              placeholder="np. Serwerownia"
              required
            />
          </div>

          <div class="col-span-2 space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Opcjonalny opis przeznaczenia sensora"
              :rows="3"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <DialogClose as-child>
            <Button type="button" variant="outline">Anuluj</Button>
          </DialogClose>
          <Button type="submit">Zapisz zmiany</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
