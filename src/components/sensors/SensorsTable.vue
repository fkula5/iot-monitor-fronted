<script setup lang="ts">
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";

interface SensorType {
  id: number;
  name: string;
  unit: string;
}

interface Sensor {
  id: number;
  name: string;
  location: string | null;
  active: boolean;
  sensor_type: SensorType;
  created_at: string;
}

interface Props {
  sensors: Sensor[];
}

defineProps<Props>();

const emit = defineEmits<{
  edit: [sensor: Sensor];
  delete: [id: number];
}>();

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <Table class="border-separate border-spacing-y-2">
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
        v-for="sensor in sensors"
        :key="sensor.id"
        class="bg-white hover:bg-gray-50 border border-gray-100 rounded-lg"
      >
        <TableCell class="font-medium rounded-l-lg">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'p-2 rounded-lg',
                sensor.active ? 'bg-green-50' : 'bg-red-50',
              ]"
            >
              <component
                :is="sensor.active ? CheckCircle : XCircle"
                :class="[
                  'h-5 w-5',
                  sensor.active ? 'text-green-600' : 'text-red-400',
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
                : 'bg-red-100 text-red-700 hover:bg-red-100',
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
              <DropdownMenuItem @click="emit('edit', sensor)">
                <Edit class="h-4 w-4 mr-2" />
                Edytuj
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                @click="emit('delete', sensor.id)"
              >
                <Trash2 class="h-4 w-4 mr-2" />
                Usuń
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
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
