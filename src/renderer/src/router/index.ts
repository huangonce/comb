import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'DashboardCollectAlibaba' }
  },
  {
    path: '/',
    redirect: { name: 'DashboardOverview' },
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '/dashboard/overview',
        name: 'DashboardOverview',
        component: () => import('../pages/dashboard/Overview.vue')
      },
      {
        path: '/dashboard/collect/alibaba',
        name: 'DashboardCollectAlibaba',
        component: () => import('../pages/dashboard/collect/AlibabaView.vue')
      },
      {
        path: '/dashboard/collect/made-in-china',
        name: 'DashboardCollectMadeInChina',
        component: () => import('../pages/dashboard/collect/MadeInChinaView.vue')
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

  console.log(to)
  console.log(from)
  next()
})

export default router
