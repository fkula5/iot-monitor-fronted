<script setup lang="ts">
import { ref, watch } from "vue";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface NewSensorType {
  name: string;
  model: string;
  manufacturer?: string;
  description?: string;
  unit: string;
  min_value?: number;
  max_value?: number;
}

interface AddSensorTypeDialogProps {
  isOpen: boolean;
}

const props = defineProps<AddSensorTypeDialogProps>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "addSensorType", sensorType: NewSensorType): void;
}>();

const formData = ref({
  name: "",
  model: "",
  manufacturer: "",
  description: "",
  unit: "",
  min_value: undefined as number | undefined,
  max_value: undefined as number | undefined,
});

const unitCategories = [
  {
    label: "Temperatura",
    units: ["°C", "°F", "K"],
  },
  {
    label: "Wilgotność / Środowisko",
    units: ["%", "RH%", "ppm", "ppb", "AQI"],
  },
  {
    label: "Elektryczność",
    units: ["V", "mV", "kV", "A", "mA", "W", "kW", "kWh", "Hz", "Ω"],
  },
  {
    label: "Ciśnienie",
    units: ["Pa", "hPa", "kPa", "bar", "psi", "atm"],
  },
  {
    label: "Odległość / Ruch",
    units: ["m", "cm", "mm", "km", "m/s", "km/h", "rpm"],
  },
  {
    label: "Światło / Dźwięk",
    units: ["lx", "lm", "cd", "dB", "dB(A)"],
  },
  {
    label: "Objętość / Przepływ",
    units: ["l", "m³", "l/min", "m³/h"],
  },
  {
    label: "Inne",
    units: ["count", "boolean (0/1)", "hex", "raw"],
  },
];

const resetForm = () => {
  formData.value = {
    name: "",
    model: "",
    manufacturer: "",
    description: "",
    unit: "",
    min_value: undefined,
    max_value: undefined,
  };
};

const handleSubmit = () => {
  if (
    !formData.value.name ||
    !formData.value.model ||
    !formData.value.manufacturer ||
    !formData.value.unit
  ) {
    alert("Proszę wypełnić wszystkie wymagane pola.");
    return;
  }

  const newSensorType: NewSensorType = {
    name: formData.value.name,
    model: formData.value.model,
    manufacturer: formData.value.manufacturer || undefined,
    description: formData.value.description || undefined,
    unit: formData.value.unit,
    min_value: formData.value.min_value,
    max_value: formData.value.max_value,
  };
  emit("addSensorType", newSensorType);
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
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Dodaj nowy typ sensora</DialogTitle>
        <DialogDescription>
          Wypełnij dane, aby dodać nowy typ sensora do systemu
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 space-y-2">
            <Label htmlFor="name">Nazwa Typu Sensora *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="np. Sensor Temperatury"
              required
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              v-model="formData.model"
              placeholder="np. DS18B20"
              required
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="manufacturer">Producent *</Label>
            <Input
              id="manufacturer"
              v-model="formData.manufacturer"
              placeholder="np. Maxim Integrated"
              required
            />
          </div>

          <div class="col-span-2 space-y-2">
            <Label>Jednostka *</Label>
            <Select v-model="formData.unit" required>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz jednostkę miary" />
              </SelectTrigger>
              <SelectContent class="max-h-[200px]">
                <SelectGroup
                  v-for="category in unitCategories"
                  :key="category.label"
                >
                  <SelectLabel>{{ category.label }}</SelectLabel>
                  <SelectItem
                    v-for="unit in category.units"
                    :key="unit"
                    :value="unit"
                  >
                    {{ unit }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label htmlFor="min_value">Wartość minimalna</Label>
            <Input
              id="min_value"
              v-model.number="formData.min_value"
              type="number"
              step="any"
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="max_value">Wartość maksymalna</Label>
            <Input
              id="max_value"
              v-model.number="formData.max_value"
              type="number"
              step="any"
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
          <Button type="submit">Dodaj typ sensora</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
