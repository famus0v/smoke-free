<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CigaretteOff, Dumbbell, WalletCards, Focus, ChevronRight, Settings } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic } from '@/lib/telegram'

const router = useRouter()
const store = useAppStore()
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер' })
const taskDone = computed(() => store.state.work.dailyFocusTasks.filter((t) => t.completed).length)
const latestWorkout = computed(() => store.state.fitness.workouts[0])
const money = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
const go = (path: string) => { haptic('light'); router.push(path) }
</script>

<template>
  <section class="screen hub">
    <div class="hub-head"><div><p class="eyebrow">Сегодня, {{ new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'long' }) }}</p><h1 class="screen-title">{{ greeting }}</h1></div><button class="settings" aria-label="Настройки" @click="go('/settings')"><Settings :size="20" /></button></div>
    <p class="screen-subtitle">Ваш день — в одном спокойном ритме.</p>

    <div class="dashboard-grid">
      <button class="metric-card smoke" @click="go('/smoking')">
        <span class="metric-icon"><CigaretteOff :size="20" /></span><span class="metric-kicker">Свобода</span>
        <strong>{{ store.cleanDays }} <small>дн.</small></strong><span class="metric-note green">+{{ money(store.savedMoney) }} {{ store.state.finance.currency }}</span>
      </button>
      <button class="metric-card fitness" @click="go('/fitness')">
        <span class="metric-icon"><Dumbbell :size="20" /></span><span class="metric-kicker">Тренировка</span>
        <strong>{{ store.state.fitness.activeSplit }}</strong><span class="metric-note">{{ latestWorkout ? 'Последняя сохранена' : 'Готовы начать' }}</span>
      </button>
      <button class="metric-card finance" @click="go('/finance')">
        <span class="metric-icon"><WalletCards :size="20" /></span><span class="metric-kicker">Можно сегодня</span>
        <strong>{{ money(store.safeToSpend) }} <small>{{ store.state.finance.currency }}</small></strong><span class="metric-note">Safe-to-Spend</span>
      </button>
      <button class="metric-card work" @click="go('/work')">
        <span class="metric-icon"><Focus :size="20" /></span><span class="metric-kicker">Главное</span>
        <strong>{{ taskDone }}/3</strong><div class="mini-progress"><i :style="{ width: `${taskDone / 3 * 100}%` }" /></div><span class="metric-note">задач завершено</span>
      </button>
    </div>

    <h2 class="section-title">Следующий шаг</h2>
    <div class="card action-list">
      <button class="action-row" @click="go('/work')"><span class="action-symbol purple"><Focus :size="18" /></span><span><b>Выбрать фокус дня</b><small>До трёх важных задач</small></span><ChevronRight :size="18" /></button>
      <button class="action-row" @click="go('/finance')"><span class="action-symbol blue"><WalletCards :size="18" /></span><span><b>Записать расход</b><small>Сохраните бюджет актуальным</small></span><ChevronRight :size="18" /></button>
    </div>
    <p class="quote">Маленькие действия создают большую дистанцию.</p>
  </section>
</template>

<style scoped>
.hub { padding-top: 22px; }.hub-head { display:flex; justify-content:space-between; align-items:flex-start; }.settings { width:38px;height:38px;border:0;border-radius:19px;color:var(--secondary);background:var(--card);display:grid;place-items:center; }
.dashboard-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }.metric-card { position:relative; min-height:166px;padding:15px;border:0;border-radius:16px;color:var(--text);background:var(--card);text-align:left;display:flex;flex-direction:column;overflow:hidden; }.metric-card:active { transform:scale(.98); }.metric-card::after { content:"";position:absolute;width:90px;height:90px;border-radius:50%;right:-35px;top:-40px;filter:blur(18px);opacity:.16; }.smoke::after{background:var(--green)}.fitness::after{background:var(--orange)}.finance::after{background:var(--accent)}.work::after{background:var(--purple)}
.metric-icon { width:34px;height:34px;border-radius:10px;display:grid;place-items:center;margin-bottom:14px; }.smoke .metric-icon{color:var(--green);background:rgba(48,209,88,.14)}.fitness .metric-icon{color:var(--orange);background:rgba(255,159,10,.14)}.finance .metric-icon{color:var(--accent);background:rgba(10,132,255,.14)}.work .metric-icon{color:var(--purple);background:rgba(191,90,242,.14)}
.metric-kicker { color:var(--secondary);font-size:12px;font-weight:600; }.metric-card strong { margin-top:4px;font-size:24px;letter-spacing:-.02em;white-space:nowrap; }.metric-card strong small { font-size:14px; }.metric-note { margin-top:auto;color:var(--secondary);font-size:12px; }.metric-note.green{color:var(--green)}.mini-progress{height:4px;margin:7px 0;background:var(--pressed);border-radius:2px}.mini-progress i{display:block;height:100%;background:var(--purple);border-radius:2px}
.action-list{overflow:hidden}.action-row{width:100%;padding:12px 13px;border:0;color:var(--text);background:transparent;display:flex;align-items:center;gap:11px;text-align:left}.action-row+.action-row{border-top:.5px solid var(--separator)}.action-row>span:nth-child(2){display:grid;gap:2px;flex:1}.action-row b{font-size:15px}.action-row small{color:var(--secondary)}.action-row>svg{color:var(--tertiary)}.action-symbol{width:34px;height:34px;border-radius:9px;color:white;display:grid;place-items:center}.purple{background:var(--purple)}.blue{background:var(--accent)}.quote{text-align:center;color:var(--tertiary);font-size:12px;margin:26px 0 0}
</style>
