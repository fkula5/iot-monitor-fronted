<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import type { ChartConfig } from "@/components/ui/chart";
import { VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";

interface Reading {
  timestamp: Date;
  value: number;
}

interface SensorInfo {
  name: string;
  unit: string;
}

const props = defineProps({
  chartData: {
    type: Array as PropType<Reading[]>,
    required: true,
  },
  sensorInfo: {
    type: Object as PropType<SensorInfo>,
    required: true,
  },
});

const chartConfig = computed(
  () =>
    ({
      value: {
        label: props.sensorInfo.name || "Wartość",
        color: "var(--chart-1)",
      },
    } satisfies ChartConfig)
);

const tickFormat = (val: number | Date | string): string => {
  let date: Date;
  if (val instanceof Date) {
    date = val;
  } else if (typeof val === "number") {
    date = new Date(val);
  } else {
    date = new Date(String(val));
  }
  return date.toLocaleTimeString("pl-PL");
};

const tooltipTemplate = computed(() => {
  return componentToString(chartConfig.value, ChartTooltipContent, {
    labelFormatter: (x: number | Date) =>
      new Date(x).toLocaleTimeString("pl-PL"),
    payload: {
      value: {
        valueFormatter: (v: number) =>
          v && v.toFixed(2)
            ? `${v.toFixed(2)} ${props.sensorInfo.unit}`
            : "Brak danych",
      },
    },
  });
});
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[200px] w-full">
    <VisXYContainer :data="props.chartData">
      <VisLine
        :x="(d: Reading) => d.timestamp"
        :y="(d: Reading) => d.value"
        :color="chartConfig.value.color"
        :attributes="{
          [chartConfig.value.label]: {
            strokeWidth: 2,
          },
        }"
      />

      <VisAxis
        type="x"
        :tickFormat="tickFormat"
        label="Czas"
        :gridLine="false"
      />
      <VisAxis
        type="y"
        :label="`Wartość (${sensorInfo.unit})`"
        :gridLine="true"
      />

      <ChartTooltip />
      <ChartCrosshair :template="tooltipTemplate" />
    </VisXYContainer>
  </ChartContainer>
</template>
