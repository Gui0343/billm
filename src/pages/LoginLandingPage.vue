<template>
  <q-page class="login-page">
    <div class="login-wrapper">
      <div class="row items-stretch q-col-gutter-lg">
        <div class="col-12 col-md">
          <q-card class="login-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-amber-9">Pagamentos por USSD</div>
            </q-card-section>
            <q-card-section>
              <div class="ussd-phone q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-caption text-primary text-weight-bold">{{ activeUssdStep.code }}</div>
                  <div class="text-caption text-grey-5">Passo {{ activeStepIndex + 1 }}/{{ ussdFlow.length }}</div>
                </div>

                <div class="text-body2 text-white text-weight-medium">{{ activeUssdStep.title }}</div>
                <div class="text-body2 text-grey-4 q-mt-sm">{{ activeUssdStep.description }}</div>
                <div class="text-body2 text-primary q-mt-md">Resposta: {{ activeUssdStep.response }}_</div>

                <div class="row q-gutter-xs q-mt-md">
                  <span
                    v-for="(_, idx) in ussdFlow"
                    :key="idx"
                    class="step-dot"
                    :class="{ 'step-dot--active': idx === activeStepIndex }"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-auto gt-sm flex flex-center">
          <q-separator vertical />
        </div>

        <div class="col-6 col-md">
          <q-card class="login-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-center">Login de Utilizador</div>
            </q-card-section>
            <q-card-section>
              <q-form class="q-gutter-md">
                <q-input v-model="name" outlined dense label="Nome" />
                <q-input v-model="email" outlined dense type="email" label="Email" />

                <q-input v-model="password" outlined dense type="password" label="Senha" />

                <div class="row justify-center">
                  <q-btn color="primary" unelevated class="login-submit-btn" label="Entrar" @click="onSubmit" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { writeAuthSession } from 'src/composables/useAuthSession'

defineOptions({ name: 'LoginLandingPage' })
const router = useRouter()

const name = ref('Ana Mondlane')
const email = ref('ana.margaridamondlane@gmail.com')
const password = ref('123456')

const ussdFlow = [
  { code: '*144#', title: 'Pagamentos em Moçambique', description: '1. Enviar pagamento  2. Histórico  0. Sair', response: '1' },
  { code: '*144# > 1', title: 'Enviar pagamento', description: 'Escolha o método: 1. Carteira móvel  2. Cartão', response: '1' },
  { code: '*144# > 1 > 1', title: 'Carteira móvel', description: 'Carteira móvel: 1. M-Pesa  2. e-Mola  3. mKesh', response: '1' },
  { code: '*144# > ...', title: 'Dados da transferência', description: 'Digite telefone destino e valor em Metical', response: '+258841234567,450' },
  { code: '*144# > confirmar', title: 'Confirmação', description: 'Transferência enviada com sucesso. Referência REF-12001', response: 'OK' }
]

const activeStepIndex = ref(0)
const activeUssdStep = computed(() => ussdFlow[activeStepIndex.value])
let timerId = null

onMounted(() => {
  timerId = window.setInterval(() => {
    activeStepIndex.value = (activeStepIndex.value + 1) % ussdFlow.length
  }, 2600)
})

onBeforeUnmount(() => {
  if (timerId) window.clearInterval(timerId)
})

function onSubmit () {
  if (!name.value.trim() || !email.value.trim() || !password.value.trim()) {
    return
  }

  const role = inferRoleFromEmail(email.value)
  writeAuthSession({
    name: name.value.trim(),
    email: email.value.trim(),
    role
  })

  if (role === 'admin') {
    router.push('/')
    return
  }
  router.push('/user/dashboard')
}

function inferRoleFromEmail (value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized.includes('admin') ? 'admin' : 'user'
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(180deg, #f7fbfa 0%, #eef4f5 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-wrapper {
  width: min(1100px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 72px 0;
}

.ussd-phone {
  max-width: 360px;
  margin: 0 auto;
  margin-bottom: 20px;
  border-radius: 18px;
  background: #0d2430;
  box-shadow: 0 20px 40px rgba(15, 36, 48, 0.2);
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.step-dot--active {
  background: #14b8a6;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 14px 36px rgba(17, 24, 39, 0.12);
}

.login-submit-btn {
  min-width: 180px;
}
</style>
