<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { type SensorType } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Props {
  sensorTypes: SensorType[];
}

defineProps<Props>();

const emit = defineEmits<{
  edit: [sensorType: SensorType];
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
        <TableHead class="text-gray-600">Nazwa</TableHead>
        <TableHead class="text-gray-600">Model</TableHead>
        <TableHead class="text-gray-600">Producent</TableHead>
        <TableHead class="text-gray-600">Jednostka</TableHead>
        <TableHead class="text-gray-600">Min. wartość</TableHead>
        <TableHead class="text-gray-600">Max. wartość</TableHead>
        <TableHead class="text-gray-600">Utworzony</TableHead>
        <TableHead class="text-right text-gray-600">Akcje</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="sensorType in sensorTypes"
        :key="sensorType.id"
        class="bg-white hover:bg-gray-50 border border-gray-100 rounded-lg"
      >
        <TableCell class="text-left">
          <div>
            <p class="font-medium text-gray-900">{{ sensorType.name }}</p>
            <p class="text-xs text-gray-500">ID: {{ sensorType.id }}</p>
          </div>
        </TableCell>
        <TableCell class="text-left">{{ sensorType.manufacturer }}</TableCell>
        <TableCell class="text-left">{{ sensorType.model }}</TableCell>
        <TableCell class="text-left">{{ sensorType.unit }}</TableCell>
        <TableCell class="text-left">{{ sensorType.min_value }}</TableCell>
        <TableCell class="text-left">{{ sensorType.max_value }}</TableCell>
        <TableCell class="text-left">{{
          formatDate(sensorType.created_at)
        }}</TableCell>
        <TableCell class="text-right rounded-r-lg">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                <MoreHorizontal class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <RouterLink
                :to="`/panel/sensor-types/${sensorType.id}`"
                class="no-underline"
              >
                <DropdownMenuItem>
                  <Eye class="h-4 w-4 mr-2" />
                  Szczegóły
                </DropdownMenuItem>
              </RouterLink>
              <DropdownMenuItem @click="emit('edit', sensorType)">
                <Edit class="h-4 w-4 mr-2" />
                Edytuj
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                @click="emit('delete', sensorType.id)"
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
