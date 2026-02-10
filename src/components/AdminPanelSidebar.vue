<script lang="ts" setup>
import { RouterLink } from "vue-router";
import {
  Activity,
  AlertTriangle,
  Home,
  Gauge,
  Folder,
  RadioReceiver,
} from "lucide-vue-next";
</script>

<template>
  <div class="hidden border-r bg-white md:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <RouterLink to="/panel" class="flex items-center gap-3 font-semibold">
          <div class="p-2 bg-blue-600 rounded-lg">
            <Gauge class="h-5 w-5 text-white" />
          </div>
          <span class="text-lg font-bold text-gray-900">IoT Monitor</span>
        </RouterLink>
      </div>

      <div class="flex-1 px-3 py-4">
        <nav class="grid items-start gap-2 text-sm font-medium">
          <RouterLink
            to="/panel"
            exact-active-class="bg-blue-50 text-blue-700"
            v-slot="{ isActive }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-all hover:bg-gray-100"
          >
            <Home :class="['h-4 w-4', isActive && 'text-blue-700']" />
            <span :class="[isActive && 'font-semibold']">Panel Główny</span>
          </RouterLink>

          <RouterLink
            to="/panel/sensors"
            active-class="bg-blue-50 text-blue-700"
            v-slot="{ isActive }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-all hover:bg-gray-100"
          >
            <Activity :class="['h-4 w-4', isActive && 'text-blue-700']" />
            <span :class="[isActive && 'font-semibold']">Sensory</span>
          </RouterLink>

          <RouterLink
            to="/panel/sensor-types"
            active-class="bg-blue-50 text-blue-700"
            v-slot="{ isActive }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-all hover:bg-gray-100"
          >
            <RadioReceiver :class="['h-4 w-4', isActive && 'text-blue-700']" />
            <span :class="[isActive && 'font-semibold']">Typy Sensorów</span>
          </RouterLink>

          <RouterLink
            to="/panel/groups"
            active-class="bg-blue-50 text-blue-700"
            v-slot="{ isActive }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-all hover:bg-gray-100"
          >
            <Folder :class="['h-4 w-4', isActive && 'text-blue-700']" />
            <span :class="[isActive && 'font-semibold']">Grupy</span>
          </RouterLink>

          <RouterLink
            to="/panel/alerts"
            active-class="bg-blue-50 text-blue-700"
            v-slot="{ isActive }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-all hover:bg-gray-100"
          >
            <AlertTriangle :class="['h-4 w-4', isActive && 'text-blue-700']" />
            <span :class="[isActive && 'font-semibold']">Alerty</span>
            <span
              v-if="!isActive"
              class="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              3
            </span>
          </RouterLink>
        </nav>
      </div>

      <div class="border-t p-4">
        <div class="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50">
          <div
            class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <span class="text-white text-sm font-medium">U</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">User</p>
            <p class="text-xs text-gray-500 truncate">user@example.com</p>
          </div>
        </div>
        <p class="text-xs text-gray-500 text-center mt-4">IoT Monitor v1.0.0</p>
      </div>
    </div>
  </div>
</template>
