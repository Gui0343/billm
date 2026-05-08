const routes = [
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/LoginLandingPage.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/DashboardAdminPage.vue') },
      { path: 'payments', component: () => import('pages/PaymentsPage.vue') },
      { path: 'users', component: () => import('pages/UsersPage.vue') },
      { path: 'user/dashboard', component: () => import('pages/UserDashboardPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
