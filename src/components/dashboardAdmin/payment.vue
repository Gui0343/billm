<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @hide="resetForm"
  >
    <q-card class="payment-dialog-card" style="width: min(100vw - 32px, 520px)">
      <q-card-section class="row items-start no-wrap q-pb-sm">
        <q-icon name="account_balance_wallet" color="warning" size="28px" class="q-mr-sm q-mt-xs" />
        <div class="col">
          <div class="text-h6 text-weight-bold">Efectuar pagamento</div>
          
        </div>
        <q-btn flat dense round icon="close" class="text-grey-7" @click="close" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" greedy @submit.prevent="onSubmit">
          <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Operador</div>
          <q-select
            v-model="operator"
            :options="operatorOptions"
            outlined
            dense
            emit-value
            map-options
            color="primary"
            :rules="[val => !!val || 'Seleccione o operador']"
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Valor (MZN)</div>
              <q-input
                v-model.number="amount"
                type="number"
                outlined
                dense
                color="primary"
                min="1"
                step="1"
                :rules="[
                  val => val != null && val !== '' || 'Indique o valor',
                  val => Number(val) > 0 || 'Valor deve ser maior que zero'
                ]"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Referência</div>
              <q-input
                v-model="reference"
                outlined
                dense
                color="primary"
                placeholder="opcional"
              />
            </div>
          </div>

          <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Telefone destino</div>
          <q-input
            v-model="phone"
            outlined
            dense
            color="primary"
            placeholder="+258 8x xxxx xxx"
            :rules="[val => !!val && String(val).trim().length >= 8 || 'Telefone inválido']"
            class="q-mb-md"
          />

         <!-- <q-card flat bordered class="rounded-borders q-pa-md q-mb-md bg-grey-1">
            <div class="row items-center no-wrap">
              <q-icon name="cloud" color="primary" size="22px" class="q-mr-sm" />
              <div class="col">
                <div class="text-body2 text-weight-medium">Modo online</div>
               <div class="text-caption text-grey-7">Envio directo via PSP</div>
              </div>
              <q-toggle v-model="onlineMode" color="primary" />
            </div>
          </q-card>-->

          <!--div class="row q-gutter-xs q-mb-lg">
            <q-chip dense outline color="grey-7" text-color="grey-8" size="sm">SIMULAÇÃO</q-chip>
            <q-chip dense outline color="grey-7" text-color="grey-8" size="sm">IDEMPOTENTE</q-chip>
          </div>--> 

          <div class="row justify-end q-gutter-sm">
            <q-btn outline color="grey-7" label="Cancelar" @click="close" />
            <q-btn unelevated color="primary" text-color="white" label="Confirmar pagamento" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({ name: 'PaymentFormDialog' })

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const $q = useQuasar()

const formRef = ref(null)
const operator = ref('M-Pesa')
const operatorOptions = [
  { label: 'M-Pesa', value: 'M-Pesa' },
  { label: 'e-Mola', value: 'e-Mola' },
  { label: 'Mkesh', value: 'Mkesh' },
  { label: 'Cartão', value: 'Cartão' }
]
const amount = ref(500)
const reference = ref('')
const phone = ref('')
const onlineMode = ref(true)

function resetForm () {
  operator.value = 'M-Pesa'
  amount.value = 500
  reference.value = ''
  phone.value = ''
  onlineMode.value = true
  formRef.value?.resetValidation?.()
}

function close () {
  emit('update:modelValue', false)
}

function formatNow () {
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())
}

function onSubmit () {
  const row = {
    id: `TX-${Date.now()}`,
    customer: phone.value.trim(),
    amount: `MZN ${new Intl.NumberFormat('pt-MZ').format(Number(amount.value))}`,
    channel: operator.value,
    status: onlineMode.value ? 'processing' : 'pending',
    createdAt: formatNow(),
    reference: reference.value.trim() || null,
    onlineMode: onlineMode.value
  }

  emit('submitted', row)
  $q.notify({
    type: 'positive',
    message: 'Pagamento registado (simulação)',
    caption: `${row.channel} · ${row.amount}`,
    position: 'top',
    timeout: 2500
  })
  close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      formRef.value?.resetValidation?.()
    }
  }
)
</script>

<style scoped>
.payment-dialog-card {
  border-radius: 12px;
  background: #fafaf8;
}
</style>
