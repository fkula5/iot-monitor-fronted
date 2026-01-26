<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Component } from "vue";

interface Props {
  title: string;
  value: string | number;
  description?: string;
  icon: Component;
  iconColor?: string;
  valueColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: "bg-blue-50 text-blue-600",
  valueColor: "text-gray-900",
});
</script>

<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader
      class="flex flex-row items-center justify-between pb-2"
      v-if="title"
    >
      <CardTitle class="text-sm font-medium text-gray-600">
        {{ title }}
      </CardTitle>
      <div :class="['p-2 rounded-lg', iconColor]">
        <component :is="icon" class="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent :class="title ? '' : 'pt-6'">
      <div class="flex items-center justify-between">
        <div>
          <p v-if="!title" class="text-sm text-gray-600 mb-1">
            {{ description }}
          </p>
          <div :class="['text-3xl font-bold', valueColor]">
            {{ value }}
          </div>
          <p v-if="title && description" class="text-xs text-gray-500 mt-1">
            {{ description }}
          </p>
        </div>
        <div v-if="!title" :class="['p-3 rounded-lg', iconColor]">
          <component :is="icon" class="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
