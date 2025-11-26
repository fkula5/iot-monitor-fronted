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
  return new Date(dateString).toLocaleString("pl-PL");
}

const filteredSensors = computed(() => {
  if (!searchTerm.value) {
    return sensors.value;
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return sensors.value.filter(
    (sensor) =>
      sensor.name.toLowerCase().includes(lowerCaseSearch) ||
      sensor.location?.toLowerCase().includes(lowerCaseSearch)
  );
});

const isAddSensorDialogOpen = ref(false);

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
    isLoading.value = true;

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
    isLoading.value = false;
  } catch (err: any) {
    error.value = err.message || "Nie udało się dodać sensora.";
  } finally {
    isLoading.value = false;
  }

  await fetchSensors();
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center text-muted-foreground">
      Ładowanie danych...
    </div>

    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>

    <Card v-else>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Zarządzanie Sensorami</CardTitle>
          <div class="flex gap-2">
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
            <Button @click="isAddSensorDialogOpen = true" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Dodaj Sensor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex items-center space-x-4 mb-6">
          <div class="relative flex-1 max-w-sm">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <Input
              v-model="searchTerm"
              placeholder="Szukaj sensorów..."
              class="pl-10"
            />
          </div>
        </div>

        <div
          v-if="filteredSensors.length === 0"
          class="text-center text-muted-foreground mt-8"
        >
          Nie znaleziono sensorów pasujących do Twoich kryteriów.
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Nr</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Lokalizacja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ostatni Odczyt</TableHead>
              <TableHead>Utworzono</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="sensor in filteredSensors" :key="sensor.id">
              <TableCell class="font-mono text-sm">{{
                filteredSensors.indexOf(sensor) + 1
              }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <CheckCircle
                    v-if="sensor.active"
                    class="h-4 w-4 text-green-600"
                  />
                  <XCircle v-else class="h-4 w-4 text-red-600" />
                  {{ sensor.name }}
                </div>
              </TableCell>
              <TableCell>{{ sensor.sensor_type.name }}</TableCell>
              <TableCell class="text-sm text-gray-600">
                {{ sensor.location || "Brak" }}
              </TableCell>
              <TableCell>
                <Badge
                  :class="[
                    'whitespace-nowrap',
                    sensor.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ sensor.active ? "Aktywny" : "Nieaktywny" }}
                </Badge>
              </TableCell>
              <TableCell class="font-mono"> N/A </TableCell>
              <TableCell> {{ formatDate(sensor.created_at) }} </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <RouterLink
                      :to="`/panel/sensors/${sensor.id}`"
                      class="no-underline text-inherit"
                    >
                      <DropdownMenuItem>
                        <Eye class="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </RouterLink>
                    <DropdownMenuItem>
                      <Edit class="h-4 w-4 mr-2" />
                      Edit Sensor
                    </DropdownMenuItem>
                    <DropdownMenuItem class="text-red-600">
                      <Trash2 class="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <AddSensor
      :is-open="isAddSensorDialogOpen"
      @update:is-open="isAddSensorDialogOpen = $event"
      @add-sensor="handleAddSensor"
    />
  </div>
</template>
