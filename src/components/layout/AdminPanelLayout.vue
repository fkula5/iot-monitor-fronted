<script setup lang="ts">
import AdminPanelSidebar from "./AdminPanelSidebar.vue";
import AdminPanelHeader from "./AdminPanelHeader.vue";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { config } from "@/lib/api";

const router = useRouter();

let globalWs: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

function connectGlobalWebSocket() {
  if (globalWs?.readyState === WebSocket.OPEN) return;

  try {
    const wsUrl = `${config.wsUrl}${config.endpoints.wsReadings([])}`;
    globalWs = new WebSocket(wsUrl);

    globalWs.onopen = () => {
      console.log("Global Alerts WebSocket connected");
    };

    globalWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "alert") {
          toast.error("Wykryto anomalię!", {
            description: data.payload.message || "Przekroczono limit.",
            duration: 8000,
            action: {
              label: "Sprawdź",
              onClick: () => {
                router.push("/panel/alerts");
              },
            },
          });
        }
      } catch (err) {
        console.error("Global WS parse error:", err);
      }
    };

    globalWs.onclose = () => {
      console.log("Global WS disconnected. Reconnecting...");
      reconnectTimeout = setTimeout(connectGlobalWebSocket, 5000);
    };
  } catch (err) {
    console.error("Failed to setup global WebSocket:", err);
  }
}

onMounted(() => {
  connectGlobalWebSocket();
});

onUnmounted(() => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (globalWs) {
    globalWs.close();
    globalWs = null;
  }
});
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
