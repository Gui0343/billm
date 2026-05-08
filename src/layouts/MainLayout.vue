<template>
  <q-layout view="hHh Lpr fFf" class="bg-grey-1">
    <q-header class="bg-grey-1 text-dark header-soft">
      <AppHeader
        :is-online="isOnline"
        :active-providers="2"
        :total-providers="3"
        :notifications-count="4"
        :user-name="currentSession?.name || 'Operador'"
        :user-role="isUser ? 'Utilizador' : 'Admin Financeiro'"
        @toggle-drawer="toggleLeftDrawer"
        @logout="onLogout"
      />
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      class="bg-white"
    >
      <div class="q-pa-md">
        <div class="text-subtitle1 text-weight-bold">Operações</div>
        <div class="text-caption text-grey-7">Pagamentos MZ</div>
      </div>

      <q-list padding>
        <q-item
          v-for="item in menuItems"
          :key="item.to"
          clickable
          :to="item.to"
          :active="isMenuItemActive(item.to)"
          active-class="menu-active"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-grey-1 text-grey-8">
      <AppFooter
        :offline-queue="offlineQueue"
        :retries="retries"
        :transactions="transactions"
        :failures="failures"
        :last-sync-at="lastSyncAt"
      />
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from 'layouts/Header.vue'
import AppFooter from 'layouts/Footer.vue'
import { useLastSync } from 'src/composables/useLastSync'
import { clearAuthSession, readAuthSession } from 'src/composables/useAuthSession'

defineOptions({ name: 'MainLayout' })

const { lastSyncAt, loadLastSyncFromStorage } = useLastSync()
const router = useRouter()
const route = useRoute()
const currentSession = readAuthSession()
const isUser = currentSession?.role === 'user'

const leftDrawerOpen = ref(true)
const isOnline = ref(true)

const offlineQueue = ref(13)
const retries = ref(239)
const transactions = ref(120)
const failures = ref(16)

onMounted(() => {
  loadLastSyncFromStorage()
})

const menuItems = isUser
  ? [
      { label: 'Meu Dashboard', icon: 'space_dashboard', to: '/user/dashboard' },
    ]
  : [
      { label: 'Dashboard', icon: 'dashboard', to: '/' },
      { label: 'Pagamentos', icon: 'receipt_long', to: '/payments' },
      { label: 'Utilizadores', icon: 'groups', to: '/users' }
    ]

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onLogout () {
  clearAuthSession()
  router.push('/login')
}

function isMenuItemActive (to) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
.menu-active {
  background: #eef4ff;
  color: #006400;
  border-radius: 2px;
}
.header-soft {
  box-shadow: none;
  border-bottom: 1px solid #e5e7eb;
}
</style>