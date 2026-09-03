import { createRouter, createWebHistory } from 'vue-router'
import { tg, haptic } from '@/lib/telegram'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HubView.vue') },
    { path: '/modules', name: 'modules', component: () => import('@/views/ModulesView.vue') },
    { path: '/smoking', name: 'smoking', component: () => import('@/views/SmokingView.vue') },
    { path: '/fitness', name: 'fitness', component: () => import('@/views/FitnessView.vue') },
    { path: '/finance', name: 'finance', component: () => import('@/views/FinanceView.vue') },
    { path: '/work', name: 'work', component: () => import('@/views/WorkView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  if (!tg?.BackButton) return
  const rootTabs = ['home', 'modules', 'settings']
  rootTabs.includes(String(to.name)) ? tg.BackButton.hide() : tg.BackButton.show()
})

const handleBack = () => { haptic('light'); router.back() }
tg?.BackButton?.onClick(handleBack)

export default router
