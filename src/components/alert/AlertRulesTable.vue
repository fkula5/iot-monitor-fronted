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
  Edit,
  Trash2,
  Bell,
  BellOff,
  Activity,
} from "lucide-vue-next";
import { type AlertRule } from "@/lib/api";

interface Props {
  rules: AlertRule[];
}

defineProps<Props>();

const emit = defineEmits<{
  edit: [rule: AlertRule];
  delete: [id: number];
  toggle: [rule: AlertRule];
}>();

function formatCondition(condition: string) {
  const map: Record<string, string> = {
    GT: ">",
    LT: "<",
    EQ: "=",
    NEQ: "!=",
    GTE: ">=",
    LTE: "<=",
  };
  return map[condition] || condition;
}

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
        <TableHead class="text-gray-600">Nazwa Reguły</TableHead>
        <TableHead class="text-gray-600">Sensor</TableHead>
        <TableHead class="text-gray-600">Warunek</TableHead>
        <TableHead class="text-gray-600">Status</TableHead>
        <TableHead class="text-gray-600">Utworzono</TableHead>
        <TableHead class="text-right text-gray-600">Akcje</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="rule in rules"
        :key="rule.id"
        class="bg-white hover:bg-gray-50 border border-gray-100 rounded-lg"
      >
        <TableCell class="font-medium rounded-l-lg text-left">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'p-2 rounded-lg',
                rule.is_active ? 'bg-blue-50' : 'bg-gray-50',
              ]"
            >
              <Bell
                v-if="rule.is_active"
                class="h-5 w-5 text-blue-600"
              />
              <BellOff
                v-else
                class="h-5 w-5 text-gray-400"
              />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ rule.name }}</p>
              <p class="text-xs text-gray-500">ID: {{ rule.id }}</p>
            </div>
          </div>
        </TableCell>
        <TableCell class="text-left">
          <div class="flex items-center gap-2">
            <Activity class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm">
              {{ rule.sensor?.name || `Sensor #${rule.sensor_id}` }}
            </span>
          </div>
        </TableCell>
        <TableCell class="text-left">
          <Badge variant="outline" class="font-mono font-medium">
            Wartość {{ formatCondition(rule.condition) }} {{ rule.threshold }}
            {{ rule.sensor?.sensor_type?.unit || '' }}
          </Badge>
        </TableCell>
        <TableCell class="text-left">
          <Badge
            :variant="rule.is_active ? 'default' : 'secondary'"
            :class="[
              rule.is_active
                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-100',
            ]"
          >
            {{ rule.is_active ? "Aktywna" : "Nieaktywna" }}
          </Badge>
        </TableCell>
        <TableCell class="text-sm text-gray-600 text-left">
          {{ formatDate(rule.created_at) }}
        </TableCell>
        <TableCell class="text-right rounded-r-lg">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                <MoreHorizontal class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="emit('toggle', rule)">
                <component :is="rule.is_active ? BellOff : Bell" class="h-4 w-4 mr-2" />
                {{ rule.is_active ? "Dezaktywuj" : "Aktywuj" }}
              </DropdownMenuItem>
              <DropdownMenuItem @click="emit('edit', rule)">
                <Edit class="h-4 w-4 mr-2" />
                Edytuj
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                @click="emit('delete', rule.id)"
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
