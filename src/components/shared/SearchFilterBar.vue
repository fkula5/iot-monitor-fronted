<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Plus } from "lucide-vue-next";

interface Props {
  modelValue: string;
  placeholder?: string;
  isLoading?: boolean;
  showRefresh?: boolean;
  showAdd?: boolean;
  addLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Szukaj...",
  isLoading: false,
  showRefresh: true,
  showAdd: true,
  addLabel: "Dodaj",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  refresh: [];
  add: [];
}>();
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1 sm:min-w-[300px]">
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
      />
      <Input
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event as string)"
        :placeholder="placeholder"
        class="pl-9"
      />
    </div>
    <Button
      v-if="showRefresh"
      @click="emit('refresh')"
      variant="outline"
      :disabled="isLoading"
      class="gap-2"
    >
      <RefreshCw :class="['h-4 w-4', isLoading && 'animate-spin']" />
      Odśwież
    </Button>
    <Button v-if="showAdd" @click="emit('add')" class="gap-2">
      <Plus class="h-4 w-4" />
      {{ addLabel }}
    </Button>
  </div>
</template>
