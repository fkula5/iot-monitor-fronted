<script setup lang="ts">
import { ref, watch } from "vue";
import { type SensorType } from "@/lib/api";
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

interface EditSensorTypeProps {
  isOpen: boolean;
  sensorType: SensorType | null;
}

const props = defineProps<EditSensorTypeProps>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "updateSensorType", sensorType: SensorType): void;
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
  { label: "Temperatura", units: ["°C", "°F", "K"] },
  {
    label: "Wilgotność / Środowisko",
    units: ["%", "RH%", "ppm", "ppb", "AQI"],
  },
  {
    label: "Elektryczność",
    units: ["V", "mV", "kV", "A", "mA", "W", "kW", "kWh", "Hz", "Ω"],
  },
  { label: "Ciśnienie", units: ["Pa", "hPa", "kPa", "bar", "psi", "atm"] },
  {
    label: "Odległość / Ruch",
    units: ["m", "cm", "mm", "km", "m/s", "km/h", "rpm"],
  },
  { label: "Światło / Dźwięk", units: ["lx", "lm", "cd", "dB", "dB(A)"] },
  { label: "Objętość / Przepływ", units: ["l", "m³", "l/min", "m³/h"] },
  { label: "Inne", units: ["count", "boolean (0/1)", "hex", "raw"] },
];

watch(
  () => props.sensorType,
  (newVal) => {
    if (newVal) {
      formData.value = {
        name: newVal.name,
        model: newVal.model,
        manufacturer: newVal.manufacturer || "",
        description: newVal.description || "",
        unit: newVal.unit,
        min_value: newVal.min_value,
        max_value: newVal.max_value,
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (!props.sensorType) return;

  const updatedSensorType: SensorType = {
    ...props.sensorType,
    name: formData.value.name,
    model: formData.value.model,
    manufacturer: formData.value.manufacturer || undefined,
    description: formData.value.description || undefined,
    unit: formData.value.unit,
    min_value: formData.value.min_value ?? 0,
    max_value: formData.value.max_value ?? 0,
  };

  emit("updateSensorType", updatedSensorType);
  emit("update:isOpen", false);
};

const onOpenChange = (open: boolean) => {
  emit("update:isOpen", open);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edytuj typ sensora</DialogTitle>
        <DialogDescription>
          Zmień parametry wybranego typu sensora.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 space-y-2">
            <Label htmlFor="edit-name">Nazwa Typu Sensora *</Label>
            <Input id="edit-name" v-model="formData.name" required />
          </div>

          <div class="space-y-2">
            <Label htmlFor="edit-model">Model *</Label>
            <Input id="edit-model" v-model="formData.model" required />
          </div>

          <div class="space-y-2">
            <Label htmlFor="edit-manufacturer">Producent *</Label>
            <Input
              id="edit-manufacturer"
              v-model="formData.manufacturer"
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
            <Label htmlFor="edit-min">Wartość minimalna</Label>
            <Input
              id="edit-min"
              v-model.number="formData.min_value"
              type="number"
              step="any"
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="edit-max">Wartość maksymalna</Label>
            <Input
              id="edit-max"
              v-model.number="formData.max_value"
              type="number"
              step="any"
            />
          </div>

          <div class="col-span-2 space-y-2">
            <Label htmlFor="edit-desc">Opis</Label>
            <Textarea id="edit-desc" v-model="formData.description" :rows="3" />
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
