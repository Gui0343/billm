<template>
  <div class="charts-overview column q-gutter-md">
    <!-- Linha + donut -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card class="panel-card chart-card">
          <q-card-section class="row items-start justify-between q-pb-none">
            <div>
              <div class="text-subtitle1 text-weight-medium">Volume nas últimas 24h</div>
              <div class="text-caption text-grey-7 q-mt-xs">Sucesso por hora · MZN</div>
            </div>
            <q-badge color="negative" text-color="white" class="live-badge">LIVE</q-badge>
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <v-chart class="chart-line" :option="volumeLineOption" autoresize />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="panel-card chart-card full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">Distribuição por operador</div>
            <div class="text-caption text-grey-7 q-mt-xs">Volume processado</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <v-chart class="chart-donut" :option="distributionPieOption" autoresize />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Performance: barras + lista -->
    <q-card class="panel-card chart-card">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">Performance por operador</div>
        <div class="text-caption text-grey-7 q-mt-xs">Taxa de sucesso e total de transações</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md items-stretch">
          <div class="col-12 col-md-7">
            <v-chart class="chart-bar" :option="performanceBarOption" autoresize />
          </div>
          <div class="col-12 col-md-5">
            <div
              v-for="row in operatorPerformance"
              :key="row.name"
              class="perf-row row items-center no-wrap q-py-sm"
            >
              <div class="perf-pill" :style="{ background: row.color }" />
              <div class="col text-body2 text-weight-medium">{{ row.name }}</div>
              <div class="text-caption text-grey-8 text-right">
                {{ row.txs }} txs · {{ row.rate }}% · {{ row.amount }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

defineOptions({ name: 'DashboardChartsOverview' })

/** Alinha com a fonte global do Quasar (Roboto) */
const chartFontFamily = 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif'

const OPERATOR_COLORS = {
  'M-Pesa': '#134e4a',
  eMola: '#f97316',
  Mkesh: '#006400',
  Cartão: '#fbbf24'
}

const hours = Array.from({ length: 24 }, (_, i) => `${i}h`)

/** Picos aproximados às 5h, 13h, 17h e 23h */
const volumeByHour = [
  800, 600, 400, 1200, 2000, 11500,
  3000, 2500, 4000, 5000, 6000, 7000,
  8500, 12500, 9000, 8000, 13200,
  10000, 8000, 7000, 9000, 11000, 10500, 12800
]

const operatorPerformance = [
  { name: 'M-Pesa', color: OPERATOR_COLORS['M-Pesa'], txs: 25, rate: '60.0', amount: '66 875 MTn' },
  { name: 'eMola', color: OPERATOR_COLORS.eMola, txs: 26, rate: '65.4', amount: '75 554 MTn' },
  { name: 'Mkesh', color: OPERATOR_COLORS.Mkesh, txs: 36, rate: '50.0', amount: '111 751 MTn' },
  { name: 'Cartão', color: OPERATOR_COLORS.Cartão, txs: 33, rate: '69.7', amount: '105 999 MTn' }
]

const volumeLineOption = computed(() => ({
  textStyle: { fontFamily: chartFontFamily },
  grid: { left: 48, right: 16, top: 24, bottom: 28 },
  tooltip: { trigger: 'axis', textStyle: { fontFamily: chartFontFamily } },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: hours,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#6b7280', fontSize: 11, fontFamily: chartFontFamily }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 14000,
    interval: 3500,
    splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280', fontSize: 11, fontFamily: chartFontFamily }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: '#006400' },
      itemStyle: { color: '#006400' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 100, 0, 0.25)' },
            { offset: 1, color: 'rgba(0, 100, 0, 0.02)' }
          ]
        }
      },
      data: volumeByHour
    }
  ]
}))

const distributionPieOption = computed(() => ({
  textStyle: { fontFamily: chartFontFamily },
  tooltip: { trigger: 'item', textStyle: { fontFamily: chartFontFamily } },
  legend: {
    bottom: 0,
    left: 'center',
    textStyle: { color: '#6b7280', fontSize: 11, fontFamily: chartFontFamily }
  },
  series: [
    {
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 32, name: 'M-Pesa', itemStyle: { color: OPERATOR_COLORS['M-Pesa'] } },
        { value: 28, name: 'eMola', itemStyle: { color: OPERATOR_COLORS.eMola } },
        { value: 22, name: 'Mkesh', itemStyle: { color: OPERATOR_COLORS.Mkesh } },
        { value: 18, name: 'Cartão', itemStyle: { color: OPERATOR_COLORS.Cartão } }
      ]
    }
  ]
}))

const performanceBarOption = computed(() => ({
  textStyle: { fontFamily: chartFontFamily },
  grid: { left: 40, right: 16, top: 16, bottom: 32 },
  tooltip: { trigger: 'axis', textStyle: { fontFamily: chartFontFamily } },
  xAxis: {
    type: 'category',
    data: operatorPerformance.map((o) => o.name),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#374151', fontSize: 12, fontFamily: chartFontFamily }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 36,
    interval: 9,
    splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280', fontSize: 11, fontFamily: chartFontFamily }
  },
  series: [
    {
      type: 'bar',
      barMaxWidth: 36,
      data: operatorPerformance.map((o) => ({
        value: o.txs,
        itemStyle: { color: o.color, borderRadius: [4, 4, 0, 0] }
      }))
    }
  ]
}))
</script>

<style scoped>
.chart-card {
  border: 1px solid #e8ecf1;
}

.live-badge {
  font-size: 10px;
  padding: 4px 8px;
  animation: pulse-soft 2s ease-in-out infinite;
}

@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
}

.chart-line {
  height: 260px;
  width: 100%;
}

.chart-donut {
  height: 280px;
  width: 100%;
}

.chart-bar {
  height: 260px;
  width: 100%;
}

.perf-row + .perf-row {
  border-top: 1px solid #f0f2f5;
}

.perf-pill {
  width: 4px;
  height: 28px;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
}

.full-height {
  height: 100%;
}
</style>
