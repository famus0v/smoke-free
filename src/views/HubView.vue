<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CigaretteOff, Dumbbell, WalletCards, Focus, Settings } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic } from '@/lib/telegram'
import { useTrackerStore } from '@/stores/tracker'

const router = useRouter()
const store = useAppStore()
const tracker = useTrackerStore()
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер' })
const taskDone = computed(() => store.state.work.dailyFocusTasks.filter((task) => task.completed).length)
const latestWorkout = computed(() => store.state.fitness.workouts[0])
const spentToday = computed(() => store.state.finance.expenses.filter((expense) => expense.date.startsWith(new Date().toISOString().slice(0, 10))).reduce((sum, expense) => sum + expense.amount, 0))
const money = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
const go = (path: string) => { haptic('light'); router.push(path) }
</script>

<template>
  <section class="screen hub">
    <div class="hub-head"><div><p class="eyebrow">Сегодня, {{ new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'long' }) }}</p><h1 class="screen-title">{{ greeting }}</h1></div><button class="settings" aria-label="Настройки" @click="go('/settings')"><Settings :size="20" /></button></div>
    <div class="dashboard-grid">
      <button v-if="store.state.dashboardWidgets.includes('smoking')" class="metric-card smoke" @click="go('/smoking')"><span class="metric-icon"><CigaretteOff :size="20" /></span><span class="metric-kicker">Свобода</span><strong>{{ Math.floor(tracker.elapsedDays) }} <small>дн.</small></strong><span class="metric-note green">+{{ money(tracker.moneySaved) }} {{ tracker.profile?.currency ?? '₽' }}</span></button>
      <button v-if="store.state.dashboardWidgets.includes('fitness')" class="metric-card fitness" @click="go('/fitness')"><span class="metric-icon"><Dumbbell :size="20" /></span><span class="metric-kicker">Тренировка</span><strong>{{ store.state.fitness.activeSplit }}</strong><span class="metric-note">{{ latestWorkout ? 'Последняя сохранена' : 'Готовы начать' }}</span></button>
      <button v-if="store.state.dashboardWidgets.includes('finance')" class="metric-card finance" @click="go('/finance')"><span class="metric-icon"><WalletCards :size="20" /></span><span class="metric-kicker">Бюджет сегодня</span><strong>{{ money(spentToday) }} <small>/ {{ money(store.todayLimit) }} {{ store.state.finance.currency }}</small></strong><span class="metric-note">потрачено / можно</span></button>
      <button v-if="store.state.dashboardWidgets.includes('work')" class="metric-card work" @click="go('/work')"><span class="metric-icon"><Focus :size="20" /></span><span class="metric-kicker">Главное</span><strong>{{ taskDone }}/3</strong><div class="mini-progress"><i :style="{ width: `${taskDone / 3 * 100}%` }" /></div><span class="metric-note">задач завершено</span></button>
    </div>
  </section>
</template>

<style scoped>
.hub{padding-top:22px}.hub-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.settings{width:38px;height:38px;border:0;border-radius:19px;color:var(--secondary);background:var(--card);display:grid;place-items:center}.dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.metric-card{position:relative;min-height:166px;padding:15px;border:0;border-radius:16px;color:var(--text);background:var(--card);text-align:left;display:flex;flex-direction:column;overflow:hidden}.metric-card:active{transform:scale(.98)}.metric-card::after{content:"";position:absolute;width:90px;height:90px;border-radius:50%;right:-35px;top:-40px;filter:blur(18px);opacity:.16}.smoke::after{background:var(--green)}.fitness::after{background:var(--orange)}.finance::after{background:var(--accent)}.work::after{background:var(--purple)}.metric-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;margin-bottom:14px}.smoke .metric-icon{color:var(--green);background:rgba(48,209,88,.14)}.fitness .metric-icon{color:var(--orange);background:rgba(255,159,10,.14)}.finance .metric-icon{color:var(--accent);background:rgba(10,132,255,.14)}.work .metric-icon{color:var(--purple);background:rgba(191,90,242,.14)}.metric-kicker{color:var(--secondary);font-size:12px;font-weight:600}.metric-card strong{margin-top:4px;font-size:24px;letter-spacing:-.02em;white-space:nowrap}.metric-card.finance strong{font-size:20px;letter-spacing:-.05em}.metric-card strong small{font-size:14px}.metric-card.finance strong small{font-size:12px}.metric-note{margin-top:auto;color:var(--secondary);font-size:12px}.metric-note.green{color:var(--green)}.mini-progress{height:4px;margin:7px 0;background:var(--pressed);border-radius:2px}.mini-progress i{display:block;height:100%;background:var(--purple);border-radius:2px}
</style>