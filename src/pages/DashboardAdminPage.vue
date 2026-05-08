<template>
  <q-page class="dashboard-page q-pa-md q-pa-lg-lg">
    <div class="dashboard-wrapper">

      <!-- Header -->
      <div class="row items-center justify-between q-col-gutter-md q-mb-md">
        <div class="col-12 col-md">
          <div class="text-h5 text-weight-bold">{{ greetingWithName }}</div>
          <div class="text-subtitle2 text-grey-7">
            Operações de pagamentos • baixa conectividade • integrações externas
          </div>
        </div>

        <div class="col-12 col-md-auto row q-gutter-sm">
          <q-btn
            flat
            color="primary"
            icon="refresh"
            label="Actualizar dados"
            :loading="isRefreshing"
            @click="onRefreshData"
          />
          <q-btn unelevated color="primary" icon="add" label="Novo Pagamento" @click="paymentDialogOpen = true" />
        </div>
      </div>

      <!-- KPIs -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Taxa de sucesso (24h)</div>
              <div class="text-h5 text-weight-bold">98.7%</div>
              <div class="text-positive text-caption">+1.2% vs ontem</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Transações pendentes</div>
              <div class="text-h5 text-weight-bold">143</div>
              <div class="text-warning text-caption">16 aguardando reconciliação</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Latência média</div>
              <div class="text-h5 text-weight-bold">420ms</div>
              <div class="text-caption text-grey-7">P95: 1.3s</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Falhas integrações (24h)</div>
              <div class="text-h5 text-weight-bold">9</div>
              <div class="text-negative text-caption">M-Pesa API instável</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-tabs
        v-model="dashboardTab"
        class="dashboard-tabs text-grey-8 q-mb-none"
        active-color="primary"
        indicator-color="primary"
        align="left"
        no-caps
        dense
      >
        <q-tab name="overview" label="Visão geral" icon="insights" />
        <q-tab name="operations" label="Operações" icon="table_chart" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="dashboardTab" animated class="dashboard-panels bg-transparent q-pt-md">
        <q-tab-panel name="overview" class="q-pa-none">
          <DashboardChartsOverview :key="overviewRefreshKey" />
        </q-tab-panel>

        <q-tab-panel name="operations" class="q-pa-none">
          <div class="row q-col-gutter-md">
            <!-- Tabela de transações -->
            <div class="col-12 col-xl-8">
              <q-card class="panel-card">
                <q-card-section class="row items-center justify-between">
                  <div class="text-subtitle1 text-weight-medium">Transações recentes</div>
                  <q-input
                    dense
                    outlined
                    debounce="300"
                    placeholder="Buscar por ID, cliente, estado..."
                    style="width: 320px; max-width: 100%;"
                  >
                    <template #prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </q-card-section>

                <q-separator />

                <q-table
                  flat
                  :rows="transactions"
                  :columns="columns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 8 }"
                >
                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <q-badge
                        :color="statusColor(props.row.status)"
                        text-color="white"
                        :label="props.row.status"
                      />
                    </q-td>
                  </template>
                </q-table>
              </q-card>
            </div>

            <!-- Side panels -->
            <div class="col-12 col-xl-4">
              <div class="column q-gutter-md">
                <q-card class="panel-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-sm">Status das integrações</div>

                    <div class="row items-center justify-between q-mb-sm" v-for="item in providers" :key="item.name">
                      <div>
                        <div class="text-body2">{{ item.name }}</div>
                        <div class="text-caption text-grey-7">Latência: {{ item.latency }}</div>
                      </div>
                      <q-badge :color="item.ok ? 'positive' : 'negative'" :label="item.ok ? 'Online' : 'Degradado'" />
                    </div>
                  </q-card-section>
                </q-card>

                <q-card class="panel-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-sm">Alertas operacionais</div>
                    <q-list dense separator>
                      <q-item v-for="alert in alerts" :key="alert.id">
                        <q-item-section avatar>
                          <q-icon :name="alert.icon" :color="alert.color" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ alert.title }}</q-item-label>
                          <q-item-label caption>{{ alert.subtitle }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <PaymentFormDialog v-model="paymentDialogOpen" @submitted="onPaymentSubmitted" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import DashboardChartsOverview from 'components/dashboardAdmin/DashboardChartsOverview.vue'
import PaymentFormDialog from 'components/dashboardAdmin/payment.vue'
import { readAuthSession } from 'src/composables/useAuthSession'
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const dashboardTab = ref('overview')
const paymentDialogOpen = ref(false)
const isRefreshing = ref(false)
const overviewRefreshKey = ref(0)
const $q = useQuasar()

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'customer', label: 'Cliente', field: 'customer', align: 'left' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'left' },
  { name: 'channel', label: 'Canal', field: 'channel', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left' }
]

const transactions = ref([
  { id: 'TX-1001', customer: 'Amina Cossa', amount: 'MZN 1,250', channel: 'M-Pesa', status: 'Confirmado', createdAt: '06/05 10:31' },
  { id: 'TX-1002', customer: 'João M.', amount: 'MZN 450', channel: 'e-Mola', status: 'Pendente', createdAt: '06/05 10:28' },
  { id: 'TX-1003', customer: 'Sara A.', amount: 'MZN 3,900', channel: 'Bank Transfer', status: 'Erro', createdAt: '06/05 10:18' },
  { id: 'TX-1004', customer: 'Nelson P.', amount: 'MZN 780', channel: 'M-Pesa', status: 'Cancelado', createdAt: '06/05 10:10' }
])

function onPaymentSubmitted (row) {
  const customer = row.reference
    ? `${row.customer} · ref. ${row.reference}`
    : row.customer
  transactions.value.unshift({
    id: row.id,
    customer,
    amount: row.amount,
    channel: row.channel,
    status: row.status,
    createdAt: row.createdAt
  })
  dashboardTab.value = 'operations'
}

const providers = [
  { name: 'M-Pesa', latency: '390ms', ok: true },
  { name: 'e-Mola', latency: '640ms', ok: true },
  { name: 'Banco API', latency: '2.1s', ok: false }
]

const alerts = [
  { id: 1, icon: 'warning', color: 'warning', title: 'Fila de retry acima do normal', subtitle: '42 mensagens aguardando reenvio' },
  { id: 2, icon: 'sync_problem', color: 'negative', title: 'Reconciliação pendente', subtitle: '16 transações sem confirmação externa' },
  { id: 3, icon: 'wifi_off', color: 'primary', title: 'Pico de baixa conectividade', subtitle: 'Regiões Centro com timeout elevado' }
]

function onRefreshData () {
  if (isRefreshing.value) return
  isRefreshing.value = true

  window.setTimeout(() => {
    // Reatribui os mesmos dados para simular sincronização sem backend real.
    transactions.value = [...transactions.value]
    overviewRefreshKey.value += 1
    isRefreshing.value = false
    $q.notify({
      type: 'positive',
      message: 'Dados actualizados',
      position: 'top',
      timeout: 1800
    })
  }, 650)
}

function statusColor (status) {
  const s = String(status || '').toLowerCase()
  if (s === 'confirmed' || s === 'confirmado') return 'green'
  if (s === 'pending' || s === 'processing' || s === 'pendente') return 'orange'
  if (s === 'failed' || s === 'error' || s === 'erro') return 'red'
  if (s === 'cancelled' || s === 'cancelado') return 'grey'
  return 'grey'
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
.dashboard-page {
  background: #f6f8fb;
  min-height: 100vh;
}

.dashboard-wrapper {
  max-width: 1440px;
  margin: 0 auto;
}

.kpi-card,
.panel-card {
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
}

.dashboard-tabs :deep(.q-tab__label) {
  font-size: 0.9375rem;
  font-weight: 500;
}

.dashboard-panels :deep(.q-panel) {
  overflow: visible;
}
</style>