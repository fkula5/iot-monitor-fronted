<script setup lang="ts">
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  type?: "card" | "table" | "stats";
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "card",
  count: 4,
});
</script>

<template>
  <!-- Stats Loading -->
  <div v-if="type === 'stats'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card v-for="i in count" :key="i" class="animate-pulse">
      <CardHeader class="pb-3">
        <div class="h-4 bg-gray-200 rounded w-24"></div>
      </CardHeader>
      <CardContent>
        <div class="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div class="h-3 bg-gray-100 rounded w-32"></div>
      </CardContent>
    </Card>
  </div>

  <!-- Card Grid Loading -->
  <div
    v-else-if="type === 'card'"
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <div
      v-for="i in count"
      :key="i"
      class="h-48 bg-gray-100 rounded-lg animate-pulse"
    ></div>
  </div>

  <!-- Table Loading -->
  <div v-else-if="type === 'table'" class="space-y-3">
    <div
      v-for="i in count"
      :key="i"
      class="h-16 bg-gray-100 rounded animate-pulse"
    ></div>
  </div>
</template>
