<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CigaretteOff, Dumbbell, WalletCards, Focus, ChevronRight, Sparkles } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { useAppStore } from '@/stores/app'
import { useTrackerStore } from '@/stores/tracker'
import { impact } from '@/telegram'

const app = useAppStore()
const tracker = useTrackerStore()
const router = useRouter()
const money = (value: number) => Math.floor(value).toLocaleString('ru-RU')
const cleanDays = computed(() => tracker.profile ? Math.floor(tracker.elapsedDays) : app.cleanDays)
const saved = computed(() => tracker.profile ? tracker.moneySaved : app.savedMoney)
const tasksDone = computed(() => app.state.work.dailyFocusTasks.filter(task => task.completed).length)
const go = (path: string) => { impact('light'); router.push(path) }
</script>

<template>
  <section class="life-page">
    <AppHeader title="Сегодня" @settings="go('/settings')" />
    <section class="module-hero hub-hero">
      <span class="hero-icon"><Sparkles :size="25" /></span>
      <p>ТВОЙ LIFE OS</p><b>Всё важное — в одном месте</b><small>Смотри прогресс и выбирай следующий шаг.</small>
    </section>
    <div class="dashboard-widgets">
      <button class="dashboard-widget green" @click="go('/smoking')"><CigaretteOff :size="21"/><span>Без дыма</span><b>{{ cleanDays }} дн.</b><small>+{{ money(saved) }} ₽</small></button>
      <button class="dashboard-widget orange" @click="go('/fitness')"><Dumbbell :size="21"/><span>Тренировка</span><b>{{ app.state.fitness.activeSplit }}</b><small>{{ app.state.fitness.workouts.length ? 'История сохранена' : 'Можно начинать' }}</small></button>
      <button class="dashboard-widget blue" @click="go('/finance')"><WalletCards :size="21"/><span>Можно сегодня</span><b>{{ money(app.safeToSpend) }} ₽</b><small>Safe-to-Spend</small></button>
      <button class="dashboard-widget purple" @click="go('/work')"><Focus :size="21"/><span>Главное</span><b>{{ tasksDone }}/3</b><small>задач выполнено</small></button>
    </div>
    <p class="section-heading">БЫСТРЫЕ ДЕЙСТВИЯ</p>
    <div class="group-list action-list">
      <button class="list-action" @click="go('/smoking')"><span class="list-icon green"><CigaretteOff :size="19"/></span><span><b>Отметить тягу</b><small>Помогает увидеть триггеры</small></span><ChevronRight :size="18"/></button>
      <button class="list-action" @click="go('/finance')"><span class="list-icon blue"><WalletCards :size="19"/></span><span><b>Записать расход</b><small>Обновить доступный лимит</small></span><ChevronRight :size="18"/></button>
      <button class="list-action" @click="go('/work')"><span class="list-icon purple"><Focus :size="19"/></span><span><b>Выбрать задачи дня</b><small>Правило трёх</small></span><ChevronRight :size="18"/></button>
    </div>
  </section>
</template>
