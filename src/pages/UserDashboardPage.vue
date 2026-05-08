<template>
  <q-page class="dashboard-page q-pa-md q-pa-lg-lg">
    <div class="dashboard-wrapper">
      <div class="row items-center justify-between q-col-gutter-md q-mb-md">
        <div class="col-12 col-md">
          <div class="text-h5 text-weight-bold">{{ greetingWithName }}</div>
          <div class="text-subtitle2 text-grey-7">Histórico pessoal de pagamentos e nova transferência</div>
        </div>
        <div class="col-12 col-md-auto">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Efectuar pagamento"
            @click="paymentDialogOpen = true"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-lg-3" v-for="kpi in kpis" :key="kpi.label">
          <q-card class="panel-card">
            <q-card-section>
              <div class="text-caption text-grey-7">{{ kpi.label }}</div>
              <div class="text-h6 text-weight-bold">{{ kpi.value }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card class="panel-card history-card">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-12 col-md">
            <q-input
              v-model="search"
              dense
              outlined
              debounce="250"
              placeholder="Buscar por referência, telefone ou estado..."
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-table
          flat
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="statusColor(props.row.status)"
                text-color="white"
                :label="statusLabel(props.row.status)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <PaymentFormDialog v-model="paymentDialogOpen" @submitted="onPaymentSubmitted" />
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import PaymentFormDialog from 'components/dashboardAdmin/payment.vue'
import { readAuthSession } from 'src/composables/useAuthSession'
defineOptions({ name: 'UserDashboardPage' })

const paymentDialogOpen = ref(false)
const search = ref('')

const rows = ref([
  { id: 'USR-1001', reference: 'REF-56010', customer: '+258 84 9901234', channel: 'M-Pesa', amount: 'MZN 350', status: 'confirmed', createdAt: '07/05 09:10' },
  { id: 'USR-1002', reference: 'REF-56011', customer: '+258 86 1110088', channel: 'e-Mola', amount: 'MZN 1,000', status: 'pending', createdAt: '07/05 09:24' },
  { id: 'USR-1003', reference: 'REF-56012', customer: '+258 87 7000012', channel: 'Cartão', amount: 'MZN 420', status: 'failed', createdAt: '07/05 10:02' }
])

const columns = [
  { name: 'reference', label: 'Referência', field: 'reference', align: 'left' },
  { name: 'customer', label: 'Telefone', field: 'customer', align: 'left' },
  { name: 'channel', label: 'Canal', field: 'channel', align: 'left' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left' }
]

const kpis = computed(() => {
  const total = rows.value.length
  const done = rows.value.filter((r) => r.status === 'confirmed').length
  const pending = rows.value.filter((r) => r.status === 'pending' || r.status === 'processing').length
  const totalAmount = rows.value.reduce((sum, r) => sum + Number(String(r.amount).replace(/[^\d]/g, '')), 0)
  return [
    { label: 'Total transações', value: total },
    { label: 'Confirmadas', value: done },
    { label: 'Pendentes', value: pending },
    { label: 'Volume total', value: `MZN ${new Intl.NumberFormat('pt-MZ').format(totalAmount)}` }
  ]
})

const filteredRows = computed(() => {
  const q = String(search.value || '').toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    [r.reference, r.customer, r.channel, r.amount, r.status, r.createdAt]
      .some((item) => String(item || '').toLowerCase().includes(q))
  )
})

function statusColor (status) {
  const s = String(status || '').toLowerCase()
  if (s === 'confirmed') return 'positive'
  if (s === 'pending' || s === 'processing') return 'warning'
  if (s === 'failed' || s === 'error') return 'negative'
  if (s === 'cancelled') return 'grey'
  return 'grey-7'
}

function statusLabel (status) {
  const s = String(status || '').toLowerCase()
  if (s === 'confirmed') return 'Confirmado'
  if (s === 'pending') return 'Pendente'
  if (s === 'processing') return 'Em fila'
  if (s === 'failed' || s === 'error') return 'Erro'
  if (s === 'cancelled') return 'Cancelado'
  return status || '—'
}

function onPaymentSubmitted (row) {
  rows.value.unshift({
    id: row.id || `USR-${Date.now()}`,
    reference: row.reference || `REF-${String(Date.now()).slice(-5)}`,
    customer: row.customer || '—',
    channel: row.channel || 'Carteira móvel',
    amount: row.amount || 'MZN 0',
    status: row.status === 'processing' ? 'pending' : (row.status || 'pending'),
    createdAt: row.createdAt || new Intl.DateTimeFormat('pt-MZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date())
  })
}

const session = readAuthSession()

const userName = computed(() => session?.name || 'Utilizador')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

const greetingWithName = computed(() => `${greeting.value}, ${userName.value}`)
</script>

<style scoped>
.dashboard-page { background: #f6f8fb; min-height: 100vh; }
.dashboard-wrapper { max-width: 1280px; margin: 0 auto; }
.panel-card { border-radius: 14px; box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06); }
.history-card { margin-top: 28px; }
</style>
