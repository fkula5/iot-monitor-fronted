<script setup lang="ts">
import AdminPanelSidebar from "./AdminPanelSidebar.vue";
import AdminPanelHeader from "./AdminPanelHeader.vue";
</script>

<template>
  <div
    class="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden"
  >
    <AdminPanelSidebar />

    <div class="flex flex-col h-full overflow-hidden">
      <AdminPanelHeader />

      <main
        class="flex-1 overflow-y-auto gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20"
      >
        <div class="max-w-7xl mx-auto w-full">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
