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

const isLoading = ref(true);
const error = ref<string | null>(null);

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
  min_value: undefined,
  max_value: undefined,
});

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
    min_value: formData.value.min_value || undefined,
    max_value: formData.value.max_value || undefined,
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
            <Label htmlFor="unit">Jednostka *</Label>
            <Input
              id="unit"
              v-model="formData.unit"
              placeholder="np. °C, V, Hz"
              required
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="min_value">Wartość minimalna</Label>
            <Input
              id="min_value"
              v-model.number="formData.min_value"
              type="number"
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="max_value">Wartość maksymalna</Label>
            <Input
              id="max_value"
              v-model.number="formData.max_value"
              type="number"
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
