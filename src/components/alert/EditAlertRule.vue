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
import { Textarea } from "@/components/ui/textarea";

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

watch(
  () => props.rule,
  (newRule) => {
    if (newRule) {
      formData.value = {
        id: newRule.id,
        name: newRule.name,
        sensor_id: newRule.sensor_id.toString(),
        condition_type: newRule.condition_type,
        threshold: newRule.threshold,
        is_enabled: newRule.is_enabled,
        description: newRule.description || "",
      };
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  const name = formData.value.name.trim();
  if (!name || !formData.value.sensor_id || !formData.value.condition_type) {
    alert("Proszę wypełnić wszystkie wymagane pola.");
    return;
  }

  const updatedRule: AlertRule = {
    ...props.rule!,
    name: name,
    sensor_id: Number(formData.value.sensor_id),
    condition_type: formData.value.condition_type as any,
    threshold: Number(formData.value.threshold),
    is_enabled: formData.value.is_enabled,
    description: formData.value.description.trim() || undefined,
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
          <Label for="edit-rule-name">Nazwa Reguły *</Label>
          <Input
            id="edit-rule-name"
            v-model="formData.name"
            placeholder="np. Wysoka temperatura w serwerowni"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="edit-rule-sensor">Sensor *</Label>
            <Select v-model="formData.sensor_id" required>
              <SelectTrigger id="edit-rule-sensor">
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
            <Label for="edit-rule-condition">Warunek *</Label>
            <Select v-model="formData.condition_type" required>
              <SelectTrigger id="edit-rule-condition">
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
          <Label for="edit-rule-threshold">Próg wyzwolenia *</Label>
          <Input
            id="edit-rule-threshold"
            type="number"
            step="any"
            v-model="formData.threshold"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="edit-rule-description">Opis (opcjonalnie)</Label>
          <Textarea
            id="edit-rule-description"
            v-model="formData.description"
            placeholder="Dodatkowe informacje o regule"
            :rows="2"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="edit-rule-is-enabled"
            v-model="formData.is_enabled"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label for="edit-rule-is-enabled" class="cursor-pointer">Reguła aktywna</Label>
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
