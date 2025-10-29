<script lang="ts" setup>
import { RouterLink } from "vue-router";
import { Activity, Bell, Home, Package } from "lucide-vue-next";
</script>

<template>
  <div class="hidden border-r bg-muted/40 md:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <RouterLink to="/panel" class="flex items-center gap-2 font-semibold">
          <Package class="h-6 w-6" />
          <span class="">IoT Monitor</span>
        </RouterLink>
      </div>
      <div class="flex-1">
        <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
          <RouterLink
            to="/panel"
            exact-active-class="bg-muted text-primary"
            v-slot="{ isActive }"
          >
            <span
              :class="[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary',
              ]"
            >
              <Home class="h-4 w-4" />
              Panel Główny
            </span>
          </RouterLink>
          <RouterLink
            to="/panel/sensors"
            active-class="bg-muted text-primary"
            v-slot="{ isActive }"
          >
            <span
              :class="[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary',
              ]"
            >
              <Activity class="h-4 w-4" />
              Sensory
            </span>
          </RouterLink>
          <RouterLink
            to="/panel/alerts"
            active-class="bg-muted text-primary"
            v-slot="{ isActive }"
          >
            <span
              :class="[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary',
              ]"
            >
              <Bell class="h-4 w-4" />
              Alerty
            </span>
          </RouterLink>
        </nav>
      </div>
    </div>
  </div>
</template>
