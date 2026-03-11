<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { api, config, type Sensor, type AlertRule } from "@/lib/api";
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

interface Props {
  isOpen: boolean;
  rule: AlertRule | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "update", rule: AlertRule): void;
}>();

const isLoading = ref(true);
const sensors = ref<Sensor[]>([]);

const formData = ref({
  id: 0,
  name: "",
  sensor_id: "",
  condition: "gt",
  threshold: 0,
  is_active: true,
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

watch(
  () => props.rule,
  (newRule) => {
    if (newRule) {
      formData.value = {
        id: newRule.id,
        name: newRule.name,
        sensor_id: newRule.sensor_id.toString(),
        condition: newRule.condition,
        threshold: newRule.threshold,
        is_active: newRule.is_active,
      };
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.sensor_id || !formData.value.condition) {
    alert("Proszę wypełnić wszystkie wymagane pola.");
    return;
  }

  const updatedRule: AlertRule = {
    ...props.rule!,
    name: formData.value.name,
    sensor_id: Number(formData.value.sensor_id),
    condition: formData.value.condition as any,
    threshold: Number(formData.value.threshold),
    is_active: formData.value.is_active,
  };

  emit("update", updatedRule);
  emit("update:isOpen", false);
};

onMounted(fetchSensors);
</script>

<template>
  <Dialog :open="isOpen" @update:open="(val) => emit('update:isOpen', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edytuj Regułę Alertu</DialogTitle>
        <DialogDescription>
          Zaktualizuj warunki dla tej reguły.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="edit-name">Nazwa Reguły *</Label>
          <Input
            id="edit-name"
            v-model="formData.name"
            placeholder="np. Wysoka temperatura w serwerowni"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label htmlFor="edit-sensor">Sensor *</Label>
            <Select v-model="formData.sensor_id" required>
              <SelectTrigger id="edit-sensor">
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
            <Label htmlFor="edit-condition">Warunek *</Label>
            <Select v-model="formData.condition" required>
              <SelectTrigger id="edit-condition">
                <SelectValue placeholder="Wybierz warunek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gt">Większe niż (>)</SelectItem>
                <SelectItem value="lt">Mniejsze niż (<)</SelectItem>
                <SelectItem value="gte">Większe lub równe (>=)</SelectItem>
                <SelectItem value="lte">Mniejsze lub równe (<=)</SelectItem>
                <SelectItem value="eq">Równe (=)</SelectItem>
                <SelectItem value="neq">Różne (!=)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label htmlFor="edit-threshold">Próg wyzwolenia *</Label>
          <Input
            id="edit-threshold"
            type="number"
            step="any"
            v-model="formData.threshold"
            required
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="edit-is_active"
            v-model="formData.is_active"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="edit-is_active" class="cursor-pointer">Reguła aktywna</Label>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <DialogClose as-child>
            <Button type="button" variant="outline">Anuluj</Button>
          </DialogClose>
          <Button type="submit">Zapisz Zmiany</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
