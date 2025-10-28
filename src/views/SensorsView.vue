<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-vue-next";

const router = useRouter();

// Definicja typu dla sensora (dopasuj do danych z API)
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
      // Token wygasł lub jest nieprawidłowy
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
    sensors.value = data || []; // API zwraca bezpośrednio listę sensorów
  } catch (err: any) {
    console.error("Błąd podczas pobierania sensorów:", err);
    error.value = err.message || "Nie udało się pobrać danych sensorów.";
  } finally {
    isLoading.value = false;
  }
}

// Pobierz sensory po zamontowaniu komponentu
onMounted(fetchSensors);

// Funkcja pomocnicza do formatowania daty
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("pl-PL");
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Twoje Sensory</h1>
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

    <div
      v-else-if="sensors.length === 0"
      class="text-center text-muted-foreground mt-8"
    >
      Nie znaleziono żadnych sensorów.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="sensor in sensors" :key="sensor.id">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span>{{ sensor.name }}</span>
            <span
              :class="[
                'text-xs font-medium px-2.5 py-0.5 rounded-full',
                sensor.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ sensor.active ? "Aktywny" : "Nieaktywny" }}
            </span>
          </CardTitle>
          <CardDescription v-if="sensor.location">
            Lokalizacja: {{ sensor.location }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            v-if="sensor.description"
            class="text-sm text-muted-foreground mb-2"
          >
            {{ sensor.description }}
          </p>
          <div class="text-xs text-muted-foreground space-y-1">
            <p><strong>ID Sensora:</strong> {{ sensor.id }}</p>
            <p><strong>Typ ID:</strong> {{ sensor.sensor_type_id }}</p>
            <p>
              <strong>Ostatnia aktualizacja:</strong>
              {{ formatDate(sensor.updated_at) }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
