<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Component } from "vue";

interface Props {
  icon: Component;
  title: string;
  description: string;
  actionLabel?: string;
  showCard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCard: true,
});

const emit = defineEmits<{
  action: [];
}>();
</script>

<template>
  <Card v-if="showCard" class="text-center">
    <CardHeader>
      <CardTitle class="text-gray-900">{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4 py-8">
      <div
        class="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center"
      >
        <component :is="icon" class="h-8 w-8 text-blue-600" />
      </div>
      <p class="text-sm text-gray-600 max-w-md mx-auto">
        <slot />
      </p>
      <Button v-if="actionLabel" @click="emit('action')">
        {{ actionLabel }}
      </Button>
    </CardContent>
  </Card>
  <div v-else class="text-center py-12">
    <component :is="icon" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p class="text-gray-600 font-medium mb-2">{{ title }}</p>
    <p class="text-sm text-gray-500 mb-4">{{ description }}</p>
    <slot />
    <Button v-if="actionLabel" @click="emit('action')" class="mt-4">
      {{ actionLabel }}
    </Button>
  </div>
</template>
