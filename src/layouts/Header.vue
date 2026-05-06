<template>
    <q-toolbar class="bg-grey-1 text-dark q-px-md q-py-sm">
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Abrir menu"
        @click="$emit('toggle-drawer')"
      />
  
      <q-toolbar-title class="row items-center no-wrap">
        <q-avatar size="30px" class="bg-primary text-white q-mr-sm">B</q-avatar>
        <div>
          <div class="text-subtitle1 text-weight-bold">Bill Admin</div>
          <div class="text-caption text-grey-7">Operações de pagamentos</div>
        </div>
      </q-toolbar-title>
  
      <q-space />

      <div class="row items-center no-wrap text-caption text-grey-8 q-mr-md">
        <q-icon name="event" size="sm" class="q-mr-xs" />
        <span class="text-capitalize">{{ todayLabel }}</span>
      </div>
  
      <!-- <q-chip
        dense
        square
        color="blue-1"
        text-color="primary"
        icon="hub"
        class="q-mr-sm"
      >
        {{ activeProviders }}/{{ totalProviders }} integrações
      </q-chip> -->
  
      <q-btn flat dense round icon="notifications">
        <q-badge v-if="notificationsCount > 0" floating color="negative">
          {{ notificationsCount }}
        </q-badge>
      </q-btn>
  
      <q-btn flat dense round icon="account_circle" class="q-ml-sm">
        <q-menu anchor="bottom right" self="top right">
          <q-list style="min-width: 180px">
            <q-item clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{ userName }}</q-item-label>
                <q-item-label caption>{{ userRole }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="settings" /></q-item-section>
              <q-item-section>Definições</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('logout')">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section>Terminar sessão</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { computed } from 'vue'




  const todayLabel = computed(() =>
  new Intl.DateTimeFormat('pt-MZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
)
  
  defineOptions({ name: 'AppHeader' })
  
  defineProps({
    isOnline: { type: Boolean, default: true },
    activeProviders: { type: Number, default: 0 },
    totalProviders: { type: Number, default: 0 },
    notificationsCount: { type: Number, default: 0 },
    userName: { type: String, default: 'Operador' },
    userRole: { type: String, default: 'Admin' }
  })
  
  defineEmits(['toggle-drawer', 'logout'])
  </script>