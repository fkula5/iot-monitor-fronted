<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  Folder,
  Eye,
} from "lucide-vue-next";
import SensorGroupDialog from "@/components/SensorGroupDialog.vue";

const router = useRouter();

interface SensorType {
  name: string;
}

interface Sensor {
  id: number;
  name: string;
  location: string | null;
  active: boolean;
  sensor_type: SensorType;
}

interface SensorGroup {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  sensor_ids: number[];
  created_at: string;
  updated_at: string;
}

const groups = ref<SensorGroup[]>([]);
const sensors = ref<Sensor[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref("");
const isDialogOpen = ref(false);
const editingGroup = ref<SensorGroup | null>(null);

async function fetchGroups() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    error.value = "Nie jesteś zalogowany";
    router.push("/login");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/sensor-groups", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      router.push("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const data = await response.json();
    groups.value = data || [];
  } catch (err: any) {
    error.value = err.message;
  }
}

async function fetchSensors() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("http://localhost:8080/api/sensors", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const data = await response.json();
    sensors.value = data || [];
  } catch (err: any) {
    console.error("Błąd pobierania sensorów:", err);
  }
}

async function loadData() {
  isLoading.value = true;
  error.value = null;

  await Promise.all([fetchGroups(), fetchSensors()]);

  isLoading.value = false;
}

onMounted(loadData);

async function handleSaveGroup(group: SensorGroup) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    error.value = "Nie jesteś zalogowany. Przekierowywanie...";
    isLoading.value = false;
    setTimeout(() => router.push("/login"), 2000);
    return;
  }

  console.log(token);

  try {
    const url = group.id
      ? `http://localhost:8080/api/sensor-groups/${group.id}`
      : "http://localhost:8080/api/sensor-groups";

    const method = group.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(group),
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    await fetchGroups();
    isDialogOpen.value = false;
    editingGroup.value = null;
  } catch (err: any) {
    error.value = err.message;
  }
}

async function handleDeleteGroup(groupId: number) {
  if (!confirm("Czy na pewno chcesz usunąć tę grupę?")) return;

  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/sensor-groups/${groupId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    await fetchGroups();
  } catch (err: any) {
    error.value = err.message;
  }
}

function openEditDialog(group: SensorGroup) {
  editingGroup.value = { ...group };
  isDialogOpen.value = true;
}

function openCreateDialog() {
  editingGroup.value = null;
  isDialogOpen.value = true;
}

const filteredGroups = computed(() => {
  if (!searchTerm.value) return groups.value;

  const term = searchTerm.value.toLowerCase();
  return groups.value.filter(
    (group) =>
      group.name.toLowerCase().includes(term) ||
      group.description?.toLowerCase().includes(term)
  );
});

const stats = computed(() => ({
  total: groups.value.length,
  totalSensors: groups.value.reduce(
    (sum, g) => sum + (g.sensor_ids?.length || 0),
    0
  ),
}));

function getSensorsForGroup(group: SensorGroup): Sensor[] {
  if (!group.sensor_ids) return [];
  return sensors.value.filter((s) => group.sensor_ids.includes(s.id));
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          Grupy Sensorów
        </h1>
        <p class="text-gray-600 mt-2">Organizuj sensory w logiczne grupy</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Liczba Grup</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ stats.total }}
              </p>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg">
              <Folder class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Sensory w Grupach</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ stats.totalSensors }}
              </p>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
              <Eye class="h-6 w-6 text-green-600" />
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
          <CardTitle class="text-gray-900">Lista Grup</CardTitle>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1 sm:min-w-[300px]">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
              />
              <Input
                v-model="searchTerm"
                placeholder="Szukaj grup..."
                class="pl-9"
              />
            </div>
            <Button
              @click="loadData"
              variant="outline"
              :disabled="isLoading"
              class="gap-2"
            >
              <RefreshCw :class="['h-4 w-4', isLoading && 'animate-spin']" />
              Odśwież
            </Button>
            <Button @click="openCreateDialog" class="gap-2">
              <Plus class="h-4 w-4" />
              Nowa Grupa
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="i in 6"
            :key="i"
            class="h-48 bg-gray-100 rounded-lg animate-pulse"
          ></div>
        </div>

        <div v-else-if="filteredGroups.length === 0" class="text-center py-12">
          <Folder class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 font-medium mb-2">
            {{ searchTerm ? "Nie znaleziono grup" : "Brak grup" }}
          </p>
          <p class="text-sm text-gray-500 mb-4">
            {{
              searchTerm
                ? "Spróbuj użyć innych kryteriów wyszukiwania"
                : "Stwórz pierwszą grupę, aby organizować sensory"
            }}
          </p>
          <Button v-if="!searchTerm" @click="openCreateDialog" class="gap-2">
            <Plus class="h-4 w-4" />
            Utwórz Grupę
          </Button>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="group in filteredGroups"
            :key="group.id"
            class="hover:shadow-md transition-shadow"
          >
            <CardHeader class="pb-3">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    class="p-2 rounded-lg flex-shrink-0"
                    :style="{ backgroundColor: group.color + '20' }"
                  >
                    <Folder class="h-5 w-5" :style="{ color: group.color }" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 truncate">
                      {{ group.name }}
                    </h3>
                    <p
                      v-if="group.description"
                      class="text-xs text-gray-500 mt-1 line-clamp-2"
                    >
                      {{ group.description }}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openEditDialog(group)">
                      <Edit class="h-4 w-4 mr-2" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      @click="handleDeleteGroup(group.id)"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Sensory:</span>
                  <Badge variant="secondary">
                    {{ group.sensor_ids?.length || 0 }}
                  </Badge>
                </div>
                <div
                  v-if="group.sensor_ids?.length > 0"
                  class="space-y-1 max-h-32 overflow-y-auto"
                >
                  <div
                    v-for="sensor in getSensorsForGroup(group).slice(0, 3)"
                    :key="sensor.id"
                    class="text-xs text-gray-600 flex items-center gap-2"
                  >
                    <div
                      :class="[
                        'w-2 h-2 rounded-full',
                        sensor.active ? 'bg-green-500' : 'bg-gray-400',
                      ]"
                    />
                    {{ sensor.name }}
                  </div>
                  <p
                    v-if="group.sensor_ids.length > 3"
                    class="text-xs text-gray-400"
                  >
                    +{{ group.sensor_ids.length - 3 }} więcej
                  </p>
                </div>
                <div class="pt-2 border-t text-xs text-gray-400">
                  Utworzono {{ formatDate(group.created_at) }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <SensorGroupDialog
      :is-open="isDialogOpen"
      :group="editingGroup"
      :sensors="sensors"
      @update:is-open="isDialogOpen = $event"
      @save="handleSaveGroup"
    />
  </div>
</template>
