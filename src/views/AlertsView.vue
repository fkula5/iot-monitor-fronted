<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Filter,
  Info,
  Search,
  X,
} from "lucide-vue-next";

interface AlertItem {
  id: number;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  sensorName: string;
  timestamp: Date;
  read: boolean;
}

// Przykładowe dane alertów
const allAlerts = ref<AlertItem[]>([
  {
    id: 1,
    type: "critical",
    title: "Temperatura przekroczona",
    description:
      "Sensor temperatury wykrył wartość powyżej dopuszczalnej (>85°C)",
    sensorName: "Sensor Temperatury #12",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Niski poziom baterii",
    description: "Bateria sensora spadła poniżej 20%",
    sensorName: "Sensor Wilgotności #7",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Aktualizacja oprogramowania",
    description: "Dostępna jest nowa wersja firmware dla sensora",
    sensorName: "Sensor Ruchu #3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 4,
    type: "success",
    title: "Połączenie przywrócone",
    description: "Sensor ponownie połączył się z siecią",
    sensorName: "Sensor CO2 #15",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 5,
    type: "critical",
    title: "Brak połączenia",
    description: "Sensor nie odpowiada od ponad 1 godziny",
    sensorName: "Sensor Dymu #9",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
  },
]);

const searchQuery = ref("");
const filterType = ref<"all" | AlertItem["type"]>("all");
const filterRead = ref<"all" | "read" | "unread">("all");

// Filtrowane alerty
const filteredAlerts = computed(() => {
  let filtered = allAlerts.value;

  // Filtruj po typie
  if (filterType.value !== "all") {
    filtered = filtered.filter((a) => a.type === filterType.value);
  }

  // Filtruj po statusie przeczytania
  if (filterRead.value === "read") {
    filtered = filtered.filter((a) => a.read);
  } else if (filterRead.value === "unread") {
    filtered = filtered.filter((a) => !a.read);
  }

  // Filtruj po wyszukiwanej frazie
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.sensorName.toLowerCase().includes(query)
    );
  }

  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
});

// Statystyki
const stats = computed(() => ({
  total: allAlerts.value.length,
  unread: allAlerts.value.filter((a) => !a.read).length,
  critical: allAlerts.value.filter((a) => a.type === "critical").length,
  warning: allAlerts.value.filter((a) => a.type === "warning").length,
}));

function getAlertIcon(type: AlertItem["type"]) {
  const icons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };
  return icons[type];
}

function getAlertColor(type: AlertItem["type"]) {
  const colors = {
    critical: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    warning:
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    info: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    success:
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  };
  return colors[type];
}

function formatTimestamp(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "teraz";
  if (diffMins < 60) return `${diffMins} min temu`;
  if (diffHours < 24) return `${diffHours}h temu`;
  if (diffDays < 7) return `${diffDays}d temu`;

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function markAsRead(id: number) {
  const alert = allAlerts.value.find((a) => a.id === id);
  if (alert) alert.read = true;
}

function markAllAsRead() {
  allAlerts.value.forEach((a) => (a.read = true));
}

function removeAlert(id: number) {
  const index = allAlerts.value.findIndex((a) => a.id === id);
  if (index > -1) allAlerts.value.splice(index, 1);
}

function clearFilters() {
  searchQuery.value = "";
  filterType.value = "all";
  filterRead.value = "all";
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Alerty</h1>
          <p class="text-muted-foreground mt-1">
            Monitoruj powiadomienia z twoich urządzeń
          </p>
        </div>
        <Button
          @click="markAllAsRead"
          variant="outline"
          size="sm"
          :disabled="stats.unread === 0"
        >
          <CheckCircle class="h-4 w-4 mr-2" />
          Oznacz wszystkie
        </Button>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <Bell class="h-4 w-4" />
              Wszystkie
            </CardDescription>
            <CardTitle class="text-3xl">{{ stats.total }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <BellOff class="h-4 w-4" />
              Nieprzeczytane
            </CardDescription>
            <CardTitle class="text-3xl text-blue-600">
              {{ stats.unread }}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <AlertCircle class="h-4 w-4" />
              Krytyczne
            </CardDescription>
            <CardTitle class="text-3xl text-red-600">
              {{ stats.critical }}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <AlertTriangle class="h-4 w-4" />
              Ostrzeżenia
            </CardDescription>
            <CardTitle class="text-3xl text-yellow-600">
              {{ stats.warning }}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Szukaj alertów..."
            class="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="gap-2">
              <Filter class="h-4 w-4" />
              Filtruj
              <span
                v-if="filterType !== 'all' || filterRead !== 'all'"
                class="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs"
              >
                {{
                  (filterType !== "all" ? 1 : 0) +
                  (filterRead !== "all" ? 1 : 0)
                }}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel>Typ alertu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="filterType = 'all'">
              Wszystkie
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterType = 'critical'">
              Krytyczne
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterType = 'warning'">
              Ostrzeżenia
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterType = 'info'">
              Informacje
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterType = 'success'">
              Sukces
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="filterRead = 'all'">
              Wszystkie
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterRead = 'unread'">
              Nieprzeczytane
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterRead = 'read'">
              Przeczytane
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          v-if="searchQuery || filterType !== 'all' || filterRead !== 'all'"
          @click="clearFilters"
          variant="ghost"
        >
          Wyczyść
        </Button>
      </div>
    </div>

    <!-- Empty State -->
    <Card
      v-if="filteredAlerts.length === 0 && allAlerts.length === 0"
      class="text-center py-12"
    >
      <CardContent class="pt-6">
        <Bell class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <CardTitle class="mb-2">Brak alertów</CardTitle>
        <CardDescription>
          Nie masz żadnych alertów. Gdy pojawią się nowe powiadomienia,
          zobaczysz je tutaj.
        </CardDescription>
      </CardContent>
    </Card>

    <!-- No Results State -->
    <Card
      v-else-if="filteredAlerts.length === 0 && allAlerts.length > 0"
      class="text-center py-12"
    >
      <CardContent class="pt-6">
        <Search class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <CardTitle class="mb-2">Brak wyników</CardTitle>
        <CardDescription class="mb-4">
          Nie znaleziono alertów pasujących do kryteriów.
        </CardDescription>
        <Button @click="clearFilters" variant="outline">
          Wyczyść filtry
        </Button>
      </CardContent>
    </Card>

    <!-- Alerts List -->
    <div v-else class="space-y-3">
      <Alert
        v-for="alert in filteredAlerts"
        :key="alert.id"
        :class="[
          'transition-all relative group',
          !alert.read && 'border-l-4',
          alert.type === 'critical' && !alert.read && 'border-l-red-600',
          alert.type === 'warning' && !alert.read && 'border-l-yellow-600',
          alert.type === 'info' && !alert.read && 'border-l-blue-600',
          alert.type === 'success' && !alert.read && 'border-l-green-600',
        ]"
      >
        <component
          :is="getAlertIcon(alert.type)"
          :class="['h-4 w-4', getAlertColor(alert.type)]"
        />
        <div class="flex-1 space-y-2">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 space-y-1">
              <AlertTitle class="flex items-center gap-2">
                {{ alert.title }}
                <span
                  v-if="!alert.read"
                  class="inline-block h-2 w-2 rounded-full bg-blue-600"
                />
              </AlertTitle>
              <AlertDescription class="text-sm">
                {{ alert.description }}
              </AlertDescription>
            </div>
            <div
              class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                v-if="!alert.read"
                @click="markAsRead(alert.id)"
                variant="ghost"
                size="icon-sm"
                title="Oznacz jako przeczytane"
              >
                <CheckCircle class="h-4 w-4" />
              </Button>
              <Button
                @click="removeAlert(alert.id)"
                variant="ghost"
                size="icon-sm"
                title="Usuń alert"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs text-muted-foreground">
            <span class="font-medium">{{ alert.sensorName }}</span>
            <span>•</span>
            <span>{{ formatTimestamp(alert.timestamp) }}</span>
          </div>
        </div>
      </Alert>
    </div>

    <!-- Results Counter -->
    <div
      v-if="filteredAlerts.length > 0"
      class="text-sm text-muted-foreground text-center"
    >
      Wyświetlono {{ filteredAlerts.length }} z {{ stats.total }} alertów
    </div>
  </div>
</template>
