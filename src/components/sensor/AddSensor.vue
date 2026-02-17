<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { api, config, type SensorType } from "@/lib/api";
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

export interface NewSensor {
  name: string;
  sensor_type_id: number;
  location: string;
  description?: string;
}

interface AddSensorDialogProps {
  isOpen: boolean;
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

const props = defineProps<AddSensorDialogProps>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "addSensor", sensor: NewSensor): void;
}>();

const formData = ref({
  name: "",
  type: "",
  location: "",
  description: "",
});

const resetForm = () => {
  formData.value = {
    name: "",
    type: "",
    location: "",
    description: "",
  };
};

const handleSubmit = () => {
  if (
    !formData.value.name ||
    !formData.value.type ||
    !formData.value.location
  ) {
    alert("Proszę wypełnić wszystkie wymagane pola.");
    return;
  }

  const newSensor: NewSensor = {
    name: formData.value.name,
    sensor_type_id: Number(formData.value.type),
    location: formData.value.location,
    description: formData.value.description || undefined,
  };
  emit("addSensor", newSensor);
  emit("update:isOpen", false);
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      setTimeout(resetForm, 300);
    }
  },
);

const onOpenChange = (open: boolean) => {
  emit("update:isOpen", open);
};

onMounted(fetchSensorTypes);
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Dodaj Nowy Sensor</DialogTitle>
        <DialogDescription>
          Wypełnij dane, aby dodać nowy sensor do sieci
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
          <Button type="submit">Dodaj Sensor</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
