<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { api, config, type Sensor } from "@/lib/api";
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

export interface NewAlertRule {
  name: string;
  sensor_id: number;
  condition_type: string;
  threshold: number;
  is_enabled: boolean;
  description?: string;
}

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "add", rule: NewAlertRule): void;
}>();

const isLoading = ref(true);
const sensors = ref<Sensor[]>([]);

const formData = ref({
  name: "",
  sensor_id: "",
  condition_type: "GT",
  threshold: 0,
  is_enabled: true,
  description: "",
});

async function fetchSensors() {
  try {
    isLoading.value = true;
    const data = await api.get<Sensor[]>(config.endpoints.sensors);
    sensors.value = data || [];
  } catch (err) {
    console.error("Failed to fetch sensors", err);
  } finally {
    isLoading.value = false;
  }
}

const resetForm = () => {
  formData.value = {
    name: "",
    sensor_id: "",
    condition_type: "GT",
    threshold: 0,
    is_enabled: true,
    description: "",
  };
};

const handleSubmit = () => {
  const name = formData.value.name.trim();
  if (!name || !formData.value.sensor_id || !formData.value.condition_type) {
    alert("Proszę wypełnić wszystkie wymagane pola.");
    return;
  }

  const newRule: NewAlertRule = {
    name: name,
    sensor_id: Number(formData.value.sensor_id),
    condition_type: formData.value.condition_type,
    threshold: Number(formData.value.threshold),
    is_enabled: formData.value.is_enabled,
    description: formData.value.description.trim() || undefined,
  };

  emit("add", newRule);
  emit("update:isOpen", false);
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      setTimeout(resetForm, 300);
    }
  }
);

onMounted(fetchSensors);
</script>

<template>
  <Dialog :open="isOpen" @update:open="(val) => emit('update:isOpen', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Dodaj Regułę Alertu</DialogTitle>
        <DialogDescription>
          Zdefiniuj warunki, dla których ma zostać wygenerowany alert.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="rule-name">Nazwa Reguły *</Label>
          <Input
            id="rule-name"
            v-model="formData.name"
            placeholder="np. Wysoka temperatura w serwerowni"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="rule-sensor">Sensor *</Label>
            <Select v-model="formData.sensor_id" required>
              <SelectTrigger id="rule-sensor">
                <SelectValue placeholder="Wybierz sensor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="sensor in sensors"
                  :key="sensor.id"
                  :value="sensor.id.toString()"
                >
                  {{ sensor.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="rule-condition">Warunek *</Label>
            <Select v-model="formData.condition_type" required>
              <SelectTrigger id="rule-condition">
                <SelectValue placeholder="Wybierz warunek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GT">Większe niż (>)</SelectItem>
                <SelectItem value="LT">Mniejsze niż (<)</SelectItem>
                <SelectItem value="GTE">Większe lub równe (>=)</SelectItem>
                <SelectItem value="LTE">Mniejsze lub równe (<=)</SelectItem>
                <SelectItem value="EQ">Równe (=)</SelectItem>
                <SelectItem value="NEQ">Różne (!=)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="rule-threshold">Próg wyzwolenia *</Label>
          <Input
            id="rule-threshold"
            type="number"
            step="any"
            v-model="formData.threshold"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="rule-description">Opis (opcjonalnie)</Label>
          <Textarea
            id="rule-description"
            v-model="formData.description"
            placeholder="Dodatkowe informacje o regule"
            :rows="2"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rule-is-enabled"
            v-model="formData.is_enabled"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label for="rule-is-enabled" class="cursor-pointer">Reguła aktywna</Label>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <DialogClose as-child>
            <Button type="button" variant="outline">Anuluj</Button>
          </DialogClose>
          <Button type="submit">Dodaj Regułę</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
