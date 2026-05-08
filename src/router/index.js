import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { readAuthSession } from 'src/composables/useAuthSession'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, _from, next) => {
    if (process.env.SERVER) {
      next()
      return
    }

    const session = readAuthSession()
    const isPublic = to.matched.some((m) => m.meta?.public)
    const requiresAuth = to.matched.some((m) => m.meta?.requiresAuth)

    if (to.path === '/') {
      if (!session) {
        next('/login')
        return
      }
      if (session.role === 'user') {
        next('/user/dashboard')
        return
      }
      next()
      return
    }

    if (to.path === '/login' && session) {
      next(session.role === 'user' ? '/user/dashboard' : '/')
      return
    }

    if (to.path.startsWith('/user/') && session?.role === 'admin') {
      next('/')
      return
    }

    if (to.path === '/payments' && session?.role === 'user') {
      next('/user/dashboard')
      return
    }

    if (to.path === '/users' && session?.role === 'user') {
      next('/user/dashboard')
      return
    }

    if (requiresAuth && !session) {
      next('/login')
      return
    }

    if (!isPublic && !requiresAuth && !session) {
      next('/login')
      return
    }

    next()
  })

  return Router
})
