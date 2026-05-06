<template>
  <q-toolbar class="q-px-md q-py-sm bg-grey-1 text-grey-8 footer-toolbar">
    <div class="row items-center q-gutter-x-lg q-gutter-y-sm wrap full-width">
      <div class="row items-center no-wrap">
        <q-icon name="cloud_off" size="18px" class="q-mr-xs text-warning" />
        <span class="text-caption">Em fila offline</span>
        <span class="text-weight-bold q-ml-xs">{{ offlineQueue }}</span>
      </div>

      <q-separator vertical inset class="gt-xs" />

      <div class="row items-center no-wrap">
        <q-icon name="refresh" size="18px" class="q-mr-xs text-primary" />
        <span class="text-caption">Retries</span>
        <span class="text-weight-bold q-ml-xs">{{ retries }}</span>
      </div>

      <q-separator vertical inset class="gt-xs" />

      <div class="row items-center no-wrap">
        <q-icon name="receipt_long" size="18px" class="q-mr-xs text-grey-7" />
        <span class="text-caption">Transações com Sucesso</span>
        <span class="text-weight-bold q-ml-xs">{{ transactions }}</span>
      </div>

      <q-separator vertical inset class="gt-xs" />

      <div class="row items-center no-wrap">
        <q-icon name="error_outline" size="18px" class="q-mr-xs text-negative" />
        <span class="text-caption">Falhas</span>
        <span class="text-weight-bold q-ml-xs text-negative">{{ failures }}</span>
      </div>

      <q-space class="gt-sm" />

      <div class="text-caption text-grey-6">
        Última sincronização: {{ lastSyncLabel }}
      </div>
    </div>
  </q-toolbar>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'AppFooter' })

const props = defineProps({
  offlineQueue: { type: Number, default: 13 },
  retries: { type: Number, default: 239 },
  transactions: { type: Number, default: 120 },
  failures: { type: Number, default: 16 },
  /** ISO string, timestamp (ms) ou Date — atualizado quando a sync acabar */
  lastSyncAt: { type: [String, Number, Date, null], default: null }
})

const lastSyncLabel = computed(() => {
  if (props.lastSyncAt == null || props.lastSyncAt === '') {
    return '—'
  }
  const d = props.lastSyncAt instanceof Date
    ? props.lastSyncAt
    : new Date(props.lastSyncAt)
  if (Number.isNaN(d.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
})
</script>

<style scoped>
.footer-toolbar {
  min-height: 48px;
  border-top: 1px solid #e5e7eb;
}
</style>