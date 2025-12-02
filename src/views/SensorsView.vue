<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-vue-next";
import type { NewSensor } from "@/components/AddSensor.vue";
import AddSensor from "@/components/AddSensor.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const router = useRouter();

interface Sensor {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  active: boolean;
  sensor_type_id: number;
  sensor_type: {
    id: number;
    name: string;
    unit: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

const sensors = ref<Sensor[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref("");
const isAddSensorDialogOpen = ref(false);

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
    const response = await fetch("http://localhost:8080/api/sensors", {
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
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const filteredSensors = computed(() => {
  if (!searchTerm.value) {
    return sensors.value;
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return sensors.value.filter(
    (sensor) =>
      sensor.name.toLowerCase().includes(lowerCaseSearch) ||
      sensor.location?.toLowerCase().includes(lowerCaseSearch) ||
      sensor.sensor_type.name.toLowerCase().includes(lowerCaseSearch)
  );
});

async function handleAddSensor(newSensor: NewSensor) {
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
    const response = await fetch("http://localhost:8080/api/sensors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newSensor),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      error.value = "Sesja wygasła. Proszę zalogować się ponownie.";
      isLoading.value = false;
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!response.ok) {
      throw new Error(`Błąd dodawania sensoru: ${response.statusText}`);
    }

    isAddSensorDialogOpen.value = false;
    error.value = null;
  } catch (err: any) {
    error.value = err.message || "Nie udało się dodać sensora.";
  } finally {
    isLoading.value = false;
    await fetchSensors();
  }
}

const stats = computed(() => ({
  total: sensors.value.length,
  active: sensors.value.filter((s) => s.active).length,
  types: new Set(sensors.value.map((s) => s.sensor_type_id)).size,
}));
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Sensory</h1>
        <p class="text-gray-600 mt-2">
          Zarządzaj wszystkimi czujnikami w systemie
        </p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Wszystkie Sensory</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ stats.total }}
              </p>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg">
              <Activity class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Aktywne</p>
              <p class="text-2xl font-bold text-green-600 mt-1">
                {{ stats.active }}
              </p>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Typy</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ stats.types }}
              </p>
            </div>
            <div class="p-3 bg-purple-50 rounded-lg">
              <Activity class="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <CardTitle class="text-gray-900">Lista Sensorów</CardTitle>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1 sm:min-w-[300px]">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
              />
              <Input
                v-model="searchTerm"
                placeholder="Szukaj sensorów..."
                class="pl-9"
              />
            </div>
            <Button
              @click="fetchSensors"
              variant="outline"
              size="default"
              :disabled="isLoading"
              class="gap-2"
            >
              <RefreshCw
                :class="['h-4 w-4', isLoading ? 'animate-spin' : '']"
              />
              Odśwież
            </Button>
            <Button @click="isAddSensorDialogOpen = true" class="gap-2">
              <Plus class="h-4 w-4" />
              Dodaj Sensor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-3">
          <div
            v-for="i in 5"
            :key="i"
            class="h-16 bg-gray-100 rounded animate-pulse"
          ></div>
        </div>

        <div v-else-if="filteredSensors.length === 0" class="text-center py-12">
          <Activity class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 font-medium mb-2">
            {{ searchTerm ? "Nie znaleziono sensorów" : "Brak sensorów" }}
          </p>
          <p class="text-sm text-gray-500">
            {{
              searchTerm
                ? "Spróbuj użyć innych kryteriów wyszukiwania"
                : "Dodaj pierwszy sensor, aby rozpocząć monitorowanie"
            }}
          </p>
          <Button
            v-if="!searchTerm"
            @click="isAddSensorDialogOpen = true"
            class="mt-4 gap-2"
          >
            <Plus class="h-4 w-4" />
            Dodaj Sensor
          </Button>
        </div>

        <Table v-else class="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow class="hover:bg-transparent border-none">
              <TableHead class="text-gray-600">Sensor</TableHead>
              <TableHead class="text-gray-600">Typ</TableHead>
              <TableHead class="text-gray-600">Lokalizacja</TableHead>
              <TableHead class="text-gray-600">Status</TableHead>
              <TableHead class="text-gray-600">Utworzono</TableHead>
              <TableHead class="text-right text-gray-600">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="sensor in filteredSensors"
              :key="sensor.id"
              class="bg-white hover:bg-gray-50 border border-gray-100 rounded-lg"
            >
              <TableCell class="font-medium rounded-l-lg">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'p-2 rounded-lg',
                      sensor.active ? 'bg-green-50' : 'bg-gray-50',
                    ]"
                  >
                    <component
                      :is="sensor.active ? CheckCircle : XCircle"
                      :class="[
                        'h-5 w-5',
                        sensor.active ? 'text-green-600' : 'text-gray-400',
                      ]"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ sensor.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ sensor.id }}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" class="font-normal">
                  {{ sensor.sensor_type.name }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-gray-600">
                {{ sensor.location || "—" }}
              </TableCell>
              <TableCell>
                <Badge
                  :variant="sensor.active ? 'default' : 'secondary'"
                  :class="[
                    sensor.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100',
                  ]"
                >
                  {{ sensor.active ? "Aktywny" : "Nieaktywny" }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-gray-600">
                {{ formatDate(sensor.created_at) }}
              </TableCell>
              <TableCell class="text-right rounded-r-lg">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <RouterLink
                      :to="`/panel/sensors/${sensor.id}`"
                      class="no-underline"
                    >
                      <DropdownMenuItem>
                        <Eye class="h-4 w-4 mr-2" />
                        Szczegóły
                      </DropdownMenuItem>
                    </RouterLink>
                    <DropdownMenuItem>
                      <Edit class="h-4 w-4 mr-2" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <Trash2 class="h-4 w-4 mr-2" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div
          v-if="!isLoading && filteredSensors.length > 0"
          class="mt-4 text-sm text-gray-600 text-center"
        >
          Wyświetlono {{ filteredSensors.length }} z
          {{ sensors.length }} sensorów
        </div>
      </CardContent>
    </Card>

    <AddSensor
      :is-open="isAddSensorDialogOpen"
      @update:is-open="isAddSensorDialogOpen = $event"
      @add-sensor="handleAddSensor"
    />
  </div>
</template>

<style scoped>
:deep(table) {
  border-collapse: separate;
  border-spacing: 0 0.5rem;
}

:deep(tbody tr) {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
</style>
