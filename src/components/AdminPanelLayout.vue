<script setup lang="ts">
import AdminPanelSidebar from "./AdminPanelSidebar.vue";
import AdminPanelHeader from "./AdminPanelHeader.vue";
</script>

<template>
  <div
    class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
  >
    <AdminPanelSidebar />
    <div class="flex flex-col">
      <AdminPanelHeader />

      <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
