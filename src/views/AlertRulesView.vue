<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { api, config, type AlertRule, type PaginatedAlertRuleResponse } from "@/lib/api";
import PageHeader from "@/components/shared/PageHeader.vue";
import AlertRulesTable from "@/components/alert/AlertRulesTable.vue";
import AddAlertRule, { type NewAlertRule } from "@/components/alert/AddAlertRule.vue";
import EditAlertRule from "@/components/alert/EditAlertRule.vue";
import { Button } from "@/components/ui/button";
import { Plus, Bell, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { toast } from "vue-sonner";
import EmptyState from "@/components/shared/EmptyState.vue";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton.vue";

const rules = ref<AlertRule[]>([]);
const isLoading = ref(true);
const isAddOpen = ref(false);
const isEditOpen = ref(false);
const selectedRule = ref<AlertRule | null>(null);

const totalCount = ref(0);
const page = ref(1);
const limit = ref(10);

const totalPages = computed(() => Math.ceil(totalCount.value / limit.value));

async function fetchRules() {
  isLoading.value = true;
  try {
    const data = await api.get<PaginatedAlertRuleResponse>(`${config.endpoints.alertRules}?page=${page.value}&limit=${limit.value}`);
    rules.value = data.alert_rules || [];
    totalCount.value = data.total_count || 0;
  } catch (error) {
    toast.error("Nie udało się pobrać reguł alertów");
  } finally {
    isLoading.value = false;
  }
}

function handlePageChange(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  fetchRules();
}

async function handleAdd(newRule: NewAlertRule) {
  try {
    const payload = {
      name: newRule.name,
      sensor_id: newRule.sensor_id,
      condition_type: newRule.condition_type,
      threshold: newRule.threshold,
      is_enabled: newRule.is_enabled,
      description: newRule.description,
    };
    await api.post<AlertRule>(config.endpoints.alertRules, payload);
    toast.success("Reguła została dodana");
    isAddOpen.value = false;
    fetchRules();
  } catch (error) {
    toast.error("Błąd podczas dodawania reguły");
  }
}

async function handleUpdate(updatedRule: AlertRule) {
  try {
    await api.put(config.endpoints.alertRule(updatedRule.id), updatedRule);
    toast.success("Reguła została zaktualizowana");
    fetchRules();
  } catch (error) {
    toast.error("Błąd podczas aktualizacji reguły");
  }
}

async function handleDelete(id: number) {
  if (!confirm("Czy na pewno chcesz usunąć tę regułę?")) return;
  
  try {
    await api.delete(config.endpoints.alertRule(id));
    toast.success("Reguła została usunięta");
    fetchRules();
  } catch (error) {
    toast.error("Błąd podczas usuwania reguły");
  }
}

async function handleToggle(rule: AlertRule) {
  try {
    const updated = { ...rule, is_enabled: !rule.is_enabled };
    await api.put(config.endpoints.alertRule(rule.id), updated);
    rule.is_enabled = updated.is_enabled;
    toast.success(rule.is_enabled ? "Reguła aktywowana" : "Reguła dezaktywowana");
  } catch (error) {
    toast.error("Wystąpił błąd");
  }
}

function openEdit(rule: AlertRule) {
  selectedRule.value = rule;
  isEditOpen.value = true;
}

onMounted(fetchRules);
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Reguły Alertów"
      description="Zarządzaj warunkami powiadomień dla Twoich sensorów"
    >
      <template #actions>
        <Button @click="isAddOpen = true">
          <Plus class="mr-2 h-4 w-4" /> Dodaj Regułę
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading">
      <LoadingSkeleton />
    </div>

    <div v-else-if="rules.length === 0">
      <EmptyState
        title="Brak reguł alertów"
        description="Nie zdefiniowano jeszcze żadnych reguł. Dodaj pierwszą regułę, aby otrzymywać powiadomienia."
        :icon="Bell"
      >
        <Button @click="isAddOpen = true" class="mt-4">
          <Plus class="mr-2 h-4 w-4" /> Dodaj Regułę
        </Button>
      </EmptyState>
    </div>

    <div v-else class="space-y-4">
      <AlertRulesTable
        :rules="rules"
        @edit="openEdit"
        @delete="handleDelete"
        @toggle="handleToggle"
      />

      <div class="flex items-center justify-between" v-if="totalPages > 1">
        <div class="text-sm text-muted-foreground">
          Strona {{ page }} z {{ totalPages }} (łącznie {{ totalCount }} reguł)
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="page === 1 || isLoading"
            @click="handlePageChange(page - 1)"
          >
            <ChevronLeft class="h-4 w-4 mr-1" />
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="page === totalPages || isLoading"
            @click="handlePageChange(page + 1)"
          >
            Następna
            <ChevronRight class="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>

    <AddAlertRule
      v-model:isOpen="isAddOpen"
      @add="handleAdd"
    />

    <EditAlertRule
      v-if="selectedRule"
      v-model:isOpen="isEditOpen"
      :rule="selectedRule"
      @update="handleUpdate"
    />
  </div>
</template>
