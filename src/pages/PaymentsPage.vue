<template>
  <q-page class="dashboard-page q-pa-md q-pa-lg-lg">
    <div class="dashboard-wrapper">
      <div class="row items-center justify-between q-col-gutter-md q-mb-md">
        <div class="col-12 col-md">
          <div class="text-h5 text-weight-bold">Pagamentos</div>
          <div class="text-subtitle2 text-grey-7">Monitoria, pesquisa e detalhes por transação</div>
        </div>
        <div class="col-12 col-md-auto">
          <q-btn unelevated color="primary" icon="add" label="Novo pagamento" @click="paymentDialogOpen = true" />
        </div>
      </div>

      <q-card class="panel-card q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-12 col-md">
            <q-input v-model="search" dense outlined debounce="250" placeholder="Buscar por referência, telefone ou carteira...">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <div class="row q-gutter-sm">
              <q-btn
                v-for="f in statusFilters"
                :key="f.value"
                :outline="statusFilter !== f.value"
                :unelevated="statusFilter === f.value"
                :color="statusFilter === f.value ? 'primary' : 'grey-7'"
                :text-color="statusFilter === f.value ? 'white' : 'grey-9'"
                class="filter-btn"
                no-caps
                @click="statusFilter = f.value"
              >{{ f.label }}</q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="panel-card">
        <q-table flat :rows="filteredRows" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 10 }">
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="statusColor(props.row.status)" text-color="white" :label="statusLabel(props.row.status)" />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn flat dense color="primary" icon="visibility" label="Detalhes" no-caps @click="openDetails(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <PaymentFormDialog v-model="paymentDialogOpen" @submitted="onPaymentSubmitted" />

    <q-dialog v-model="detailsOpen">
      <q-card class="details-card" style="width: min(100vw - 32px, 1120px)">
        <q-card-section class="row items-start no-wrap">
          <div class="col">
            <div class="text-h6 text-weight-bold">Detalhes do pagamento</div>
            <div class="text-caption text-grey-7 q-mt-xs">ID: {{ selected?.id }}</div>
          </div>
          <q-space />
          <q-btn flat dense round icon="close" class="text-grey-7" @click="detailsOpen = false" />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-sm">
          <div class="row items-stretch q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Identificação</div>
              <div class="text-body2"><span class="text-grey-7">Referência:</span><span class="text-weight-medium q-ml-xs">{{ selected?.reference || '—' }}</span></div>
              <div class="text-body2 q-mt-xs"><span class="text-grey-7">Cliente:</span><span class="text-weight-medium q-ml-xs">{{ selected?.customer || '—' }}</span></div>
              <div class="text-body2 q-mt-xs"><span class="text-grey-7">Canal:</span><span class="text-weight-medium q-ml-xs">{{ selected?.channel || '—' }}</span></div>
            </div>
            <div class="col-auto gt-sm flex flex-center"><q-separator vertical inset /></div>
            <div class="col-12 col-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Operação</div>
              <div class="text-body2"><span class="text-grey-7">Categoria:</span><span class="text-weight-medium q-ml-xs">{{ selected?.paymentGroup || '—' }}</span></div>
              <div class="text-body2 q-mt-xs"><span class="text-grey-7">Tipo:</span><span class="text-weight-medium q-ml-xs">{{ selected?.operationType || '—' }}</span></div>
              <div class="text-body2 q-mt-xs"><span class="text-grey-7">Latência:</span><span class="text-weight-medium q-ml-xs">{{ selected?.latencyMs != null ? `${selected.latencyMs} ms` : '—' }}</span></div>
              <div class="text-body2 q-mt-xs"><span class="text-grey-7">Retries:</span><span class="text-weight-medium q-ml-xs">{{ selected?.retries ?? 0 }}</span></div>
              <div class="text-body2 q-mt-xs">
                <span class="text-grey-7">Estado:</span>
                <q-badge class="q-ml-xs" :color="statusColor(selected?.status)" text-color="white" :label="statusLabel(selected?.status)" />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row items-stretch q-col-gutter-md">
            <div class="col-12 col-sm"><div class="text-caption text-grey-7">Valor</div><div class="text-body1 text-weight-medium">{{ selected?.amount || '—' }}</div></div>
            <div class="col-auto gt-xs flex flex-center"><q-separator vertical inset /></div>
            <div class="col-12 col-sm"><div class="text-caption text-grey-7">Data</div><div class="text-body1 text-weight-medium">{{ selected?.createdAt || '—' }}</div></div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import PaymentFormDialog from 'components/dashboardAdmin/payment.vue'

defineOptions({ name: 'PaymentsPage' })

const paymentDialogOpen = ref(false)
const detailsOpen = ref(false)
const selected = ref(null)
const search = ref('')
const statusFilter = ref('all')

const statusFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Confirmado', value: 'done' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Erro', value: 'failed' },
  { label: 'Em fila', value: 'queue' }
]

const columns = [
  { name: 'reference', label: 'Referência', field: 'reference', align: 'left' },
  { name: 'paymentGroup', label: 'Tipo', field: 'paymentGroup', align: 'left' },
  { name: 'customer', label: 'Cliente', field: 'customer', align: 'left' },
  { name: 'channel', label: 'Canal', field: 'channel', align: 'left' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'left' },
  { name: 'retries', label: 'Retries', field: 'retries', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' }
]

const rows = ref([
  { id: 'PAY-1001', reference: 'REF-98342', customer: '+258 84 1234567', paymentGroup: 'Carteira móvel · M-Pesa', channel: 'M-Pesa', amount: 'MZN 1,250', retries: 0, latencyMs: 420, operationType: 'Transferência', status: 'processing', createdAt: '06/05 10:31' },
  { id: 'PAY-1002', reference: 'REF-12001', customer: '+258 86 5554321', paymentGroup: 'Carteira móvel · e-Mola', channel: 'e-Mola', amount: 'MZN 450', retries: 3, latencyMs: 980, operationType: 'Depósito', status: 'pending', createdAt: '06/05 10:28' },
  { id: 'PAY-1003', reference: 'REF-77102', customer: '+258 87 9990001', paymentGroup: 'Cartão', channel: 'Cartão', amount: 'MZN 3,900', retries: 1, latencyMs: 640, operationType: 'Transferência', status: 'failed', createdAt: '06/05 10:18' }
])

function statusColor (status) {
  const s = String(status || '').toLowerCase()
  if (s === 'confirmed' || s === 'confirmado') return 'green'
  if (s === 'pending' || s === 'processing' || s === 'pendente') return 'orange'
  if (s === 'failed' || s === 'error' || s === 'erro') return 'red'
  if (s === 'cancelled' || s === 'cancelado') return 'grey'
  return 'grey-7'
}

function statusLabel (status) {
  const s = String(status || '').toLowerCase()
  if (s === 'confirmed') return 'Confirmado'
  if (s === 'pending') return 'Pendente'
  if (s === 'processing') return 'Em fila'
  if (s === 'failed') return 'Erro'
  if (s === 'cancelled') return 'Cancelado'
  return status || '—'
}

function normalize (v) { return String(v || '').toLowerCase() }

const filteredRows = computed(() => {
  const q = normalize(search.value)
  return rows.value.filter((r) => {
    const matchesText = !q || [r.reference, r.paymentGroup, r.customer, r.channel, r.amount, r.status, r.createdAt].some((x) => normalize(x).includes(q))
    const s = normalize(r.status)
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'done' && s === 'confirmed') ||
      (statusFilter.value === 'pending' && s === 'pending') ||
      (statusFilter.value === 'failed' && s === 'failed') ||
      (statusFilter.value === 'queue' && (s === 'pending' || s === 'processing'))
    return matchesText && matchesStatus
  })
})

function openDetails (row) { selected.value = row; detailsOpen.value = true }

function onPaymentSubmitted (row) {
  const paymentGroup = row.channel === 'Cartão' ? 'Cartão' : `Carteira móvel · ${row.channel}`
  rows.value.unshift({
    id: row.id,
    reference: row.reference || `REF-${String(Date.now()).slice(-5)}`,
    customer: row.customer,
    paymentGroup,
    channel: row.channel,
    amount: row.amount,
    retries: row.onlineMode ? 0 : 2,
    latencyMs: Math.round(350 + Math.random() * 700),
    operationType: row.onlineMode ? 'Transferência' : 'Depósito',
    status: row.status,
    createdAt: row.createdAt
  })
}
</script>

<style scoped>
.dashboard-page { background: #f6f8fb; min-height: 100vh; }
.dashboard-wrapper { max-width: 1440px; margin: 0 auto; }
.panel-card { border-radius: 14px; box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06); }
.filter-btn { border-radius: 12px; padding: 0 10px; }
.details-card { border-radius: 14px; }
</style>
