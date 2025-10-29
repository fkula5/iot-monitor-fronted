<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Calendar,
  Activity,
} from "lucide-vue-next";

const router = useRouter();

interface Sensor {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  active: boolean;
  sensor_type_id: number;
  created_at: string;
  updated_at: string;
}

const sensors = ref<Sensor[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");
const filterStatus = ref<"all" | "active" | "inactive">("all");

// Filtrowane sensory
const filteredSensors = computed(() => {
  let filtered = sensors.value;

  // Filtruj po statusie
  if (filterStatus.value === "active") {
    filtered = filtered.filter((s) => s.active);
  } else if (filterStatus.value === "inactive") {
    filtered = filtered.filter((s) => !s.active);
  }

  // Filtruj po wyszukiwanej frazie
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.location?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Statystyki
const stats = computed(() => ({
  total: sensors.value.length,
  active: sensors.value.filter((s) => s.active).length,
  inactive: sensors.value.filter((s) => !s.active).length,
  filtered: filteredSensors.value.length,
}));

async function fetchSensors() {
  isLoading.value = true;
  error.value = null;
  const token = localStorage.getItem("authToken");

  if (!token) {
    error.value = "Nie jesteś zalogowany. Przekierowywanie...";
    isLoading.value = false;
    setTimeout(() => router.push("/login"), 2000);
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/sensors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      error.value = "Sesja wygasła. Proszę zalogować się ponownie.";
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!response.ok) {
      throw new Error(`Błąd pobierania sensorów: ${response.statusText}`);
    }

    const data = await response.json();
    sensors.value = data || [];
  } catch (err: any) {
    console.error("Błąd podczas pobierania sensorów:", err);
    error.value = err.message || "Nie udało się pobrać danych sensorów.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchSensors);

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clearFilters() {
  searchQuery.value = "";
  filterStatus.value = "all";
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Sensory</h1>
          <p class="text-muted-foreground mt-1">
            Zarządzaj swoimi urządzeniami IoT
          </p>
        </div>
        <Button
          @click="fetchSensors"
          variant="outline"
          size="sm"
          :disabled="isLoading"
        >
          <RefreshCw
            :class="['h-4 w-4 mr-2', isLoading ? 'animate-spin' : '']"
          />
          Odśwież
        </Button>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Wszystkie</CardDescription>
            <CardTitle class="text-3xl">{{ stats.total }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Aktywne</CardDescription>
            <CardTitle class="text-3xl text-green-600">
              {{ stats.active }}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Nieaktywne</CardDescription>
            <CardTitle class="text-3xl text-red-600">
              {{ stats.inactive }}
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
            placeholder="Szukaj sensorów..."
            class="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="gap-2">
              <Filter class="h-4 w-4" />
              Filtruj
              <span
                v-if="filterStatus !== 'all'"
                class="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs"
              >
                1
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="filterStatus = 'all'">
              <span :class="filterStatus === 'all' ? 'font-semibold' : ''">
                Wszystkie
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterStatus = 'active'">
              <span :class="filterStatus === 'active' ? 'font-semibold' : ''">
                Aktywne
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="filterStatus = 'inactive'">
              <span :class="filterStatus === 'inactive' ? 'font-semibold' : ''">
                Nieaktywne
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          v-if="searchQuery || filterStatus !== 'all'"
          @click="clearFilters"
          variant="ghost"
        >
          Wyczyść
        </Button>
      </div>
    </div>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12 text-muted-foreground">
      <RefreshCw class="h-8 w-8 animate-spin mx-auto mb-4" />
      Ładowanie danych...
    </div>

    <!-- Empty State -->
    <Card
      v-else-if="!error && filteredSensors.length === 0 && sensors.length === 0"
      class="text-center py-12"
    >
      <CardContent class="pt-6">
        <Activity class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <CardTitle class="mb-2">Brak sensorów</CardTitle>
        <CardDescription class="mb-4">
          Nie znaleziono żadnych sensorów w systemie.
        </CardDescription>
        <Button @click="fetchSensors" variant="outline">
          <RefreshCw class="h-4 w-4 mr-2" />
          Odśwież Listę
        </Button>
      </CardContent>
    </Card>

    <!-- No Results State -->
    <Card
      v-else-if="!error && filteredSensors.length === 0 && sensors.length > 0"
      class="text-center py-12"
    >
      <CardContent class="pt-6">
        <Search class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <CardTitle class="mb-2">Brak wyników</CardTitle>
        <CardDescription class="mb-4">
          Nie znaleziono sensorów pasujących do kryteriów wyszukiwania.
        </CardDescription>
        <Button @click="clearFilters" variant="outline">
          Wyczyść filtry
        </Button>
      </CardContent>
    </Card>

    <!-- Sensors Grid -->
    <div
      v-else-if="!error"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Card v-for="sensor in filteredSensors" :key="sensor.id" class="group">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex-1 space-y-1">
              <CardTitle class="line-clamp-1">{{ sensor.name }}</CardTitle>
              <CardDescription
                v-if="sensor.location"
                class="flex items-center gap-1"
              >
                <MapPin class="h-3 w-3" />
                {{ sensor.location }}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edytuj</DropdownMenuItem>
                <DropdownMenuItem>Zobacz szczegóły</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Usuń
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Status Badge -->
          <div class="flex items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                sensor.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
              ]"
            >
              <span
                :class="[
                  'h-1.5 w-1.5 rounded-full',
                  sensor.active ? 'bg-green-600' : 'bg-red-600',
                ]"
              />
              {{ sensor.active ? "Aktywny" : "Nieaktywny" }}
            </span>
          </div>

          <!-- Description -->
          <p
            v-if="sensor.description"
            class="text-sm text-muted-foreground line-clamp-2"
          >
            {{ sensor.description }}
          </p>

          <!-- Metadata -->
          <div class="space-y-2 text-xs text-muted-foreground">
            <div class="flex items-center justify-between">
              <span class="font-medium">ID Sensora:</span>
              <span>{{ sensor.id }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Typ:</span>
              <span>{{ sensor.sensor_type_id }}</span>
            </div>
            <div class="flex items-center gap-1.5 pt-2 border-t">
              <Calendar class="h-3 w-3" />
              <span>{{ formatDate(sensor.updated_at) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Results Counter -->
    <div
      v-if="!error && !isLoading && filteredSensors.length > 0"
      class="text-sm text-muted-foreground text-center"
    >
      Wyświetlono {{ stats.filtered }} z {{ stats.total }} sensorów
    </div>
  </div>
</template>
