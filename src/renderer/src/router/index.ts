import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'DashboardOverview' },
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '/dashboard/overview',
        name: 'DashboardOverview',
        component: () => import('../pages/dashboard/Overview.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // Add your navigation guard logic here
  next()
})

export default router
