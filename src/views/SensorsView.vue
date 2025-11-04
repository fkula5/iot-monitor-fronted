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
  Settings,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
} from "lucide-vue-next";

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

    console.log("Pobrane sensory:", sensors.value);
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

function goToAddSensorPage() {
  router.push("/panel/sensors/add");
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
          <Button
            class="flex items-center space-x-2"
            @click="goToAddSensorPage"
          >
            <Plus class="w-4 h-4" />
            <span>Dodaj Sensor</span>
          </Button>
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
          <Button
            @click="fetchSensors"
            variant="outline"
            size="sm"
            :disabled="isLoading"
          >
            <RefreshCw
              :class="['h-4 w-4', isLoading ? 'animate-spin' : '']"
              class="mr-2"
            />
            Odśwież
          </Button>
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
              <TableHead>ID</TableHead>
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
              <TableCell class="font-mono text-sm">{{ sensor.id }}</TableCell>
              <TableCell>{{ sensor.name }}</TableCell>
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
                <div class="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Settings class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
