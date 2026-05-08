<template>
  <q-page class="users-page q-pa-md q-pa-lg-lg">
    <div class="users-wrapper">
      <div class="row items-center justify-between q-col-gutter-md q-mb-md">
        <div class="col-12 col-md">
          <div class="text-h5 text-weight-bold">Gestão de utilizadores</div>
          
        </div>
      </div>

      <q-card class="panel-card">
        <q-table
          flat
          :rows="rows"
          :columns="columns"
          row-key="email"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-role="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.role === 'admin' ? 'primary' : 'teal'"
                text-color="white"
                :label="props.row.role === 'admin' ? 'Administrador' : 'Utilizador'"
              />
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status === 'activo' ? 'green' : 'grey'"
                text-color="white"
                :label="props.row.status === 'activo' ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
defineOptions({ name: 'UsersPage' })

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'role', label: 'Perfil', field: 'role', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'left' }
]

const rows = [
  {
    name: 'Administrador do Sistema',
    email: 'admin@billmz.mz',
    role: 'admin',
    status: 'activo'
  },
  {
    name: 'Utilizador Padrão',
    email: 'user@billmz.mz',
    role: 'user',
    status: 'activo'
  }
]
</script>

<style scoped>
.users-page {
  background: #f6f8fb;
  min-height: 100vh;
}

.users-wrapper {
  max-width: 1280px;
  margin: 0 auto;
}

.panel-card {
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
}
</style>
