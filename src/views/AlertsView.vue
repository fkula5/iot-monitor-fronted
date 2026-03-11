<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { api, type PaginatedAlertResponse, type Alert } from "@/lib/api";
import PageHeader from "@/components/shared/PageHeader.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { toast } from "vue-sonner";

const alerts = ref<Alert[]>([]);
const isLoading = ref(true);
const totalCount = ref(0);
const page = ref(1);
const limit = ref(10);

const totalPages = computed(() => Math.ceil(totalCount.value / limit.value));

async function fetchAlerts() {
  isLoading.value = true;
  try {
    const response = await api.get<PaginatedAlertResponse>(`/api/alerts?page=${page.value}&limit=${limit.value}`);
    alerts.value = response.alerts || [];
    totalCount.value = response.total_count || 0;
  } catch (error) {
    toast.error("Nie udało się pobrać historii alertów");
  } finally {
    isLoading.value = false;
  }
}

function handlePageChange(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  fetchAlerts();
}

async function markAsRead(id: number) {
  try {
    await api.post(`/api/alerts/${id}/read`, {});
    toast.success("Oznaczono jako przeczytane");

    const alert = alerts.value.find((a) => a.id === id);
    if (alert) {
      alert.is_read = true;
    }
  } catch (error) {
    toast.error("Wystąpił błąd");
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("pl-PL");
}

onMounted(() => {
  fetchAlerts();
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Historia Alertów"
      description="Zarządzaj powiadomieniami z Twoich czujników"
    >
      <template #actions>
        <Button @click="fetchAlerts" variant="outline">Odśwież</Button>
      </template>
    </PageHeader>

    <div class="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Wiadomość</TableHead>
            <TableHead>Wartość</TableHead>
            <TableHead>Data wystąpienia</TableHead>
            <TableHead class="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="5" class="text-center py-8"
              >Ładowanie danych...</TableCell
            >
          </TableRow>

          <TableRow v-else-if="alerts.length === 0">
            <TableCell
              colspan="5"
              class="text-center py-8 text-muted-foreground"
            >
              Brak alertów w systemie.
            </TableCell>
          </TableRow>

          <TableRow
            v-else
            v-for="alert in alerts"
            :key="alert.id"
            :class="{ 'bg-red-50/50 dark:bg-red-950/20': !alert.is_read }"
          >
            <TableCell>
              <Badge :variant="alert.is_read ? 'secondary' : 'destructive'">
                <AlertTriangle
                  v-if="!alert.is_read"
                  class="w-3 h-3 mr-1 inline"
                />
                {{ alert.is_read ? "Przeczytane" : "Nowy" }}
              </Badge>
            </TableCell>
            <TableCell class="font-medium">{{ alert.message }}</TableCell>
            <TableCell>{{ alert.value.toFixed(2) }}</TableCell>
            <TableCell>{{ formatDate(alert.triggered_at) }}</TableCell>
            <TableCell class="text-right">
              <Button
                v-if="!alert.is_read"
                size="sm"
                variant="ghost"
                @click="markAsRead(alert.id)"
              >
                <CheckCircle class="w-4 h-4 mr-2" />
                Oznacz
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between" v-if="totalPages > 1">
      <div class="text-sm text-muted-foreground">
        Strona {{ page }} z {{ totalPages }} (łącznie {{ totalCount }} alertów)
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page === 1 || isLoading"
          @click="handlePageChange(page - 1)"
        >
          <ChevronLeft class="h-4 w-4 mr-1" />
          Poprzednia
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="page === totalPages || isLoading"
          @click="handlePageChange(page + 1)"
        >
          Następna
          <ChevronRight class="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>
