<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, Wind, CigaretteOff, Trophy, BriefcaseBusiness, Coffee, Heart, Flame, BadgeDollarSign, TrendingUp, CalendarDays, ReceiptText } from 'lucide-vue-next'
import AppHeader from './components/AppHeader.vue'
import TimeCounter from './components/TimeCounter.vue'
import MetricCard from './components/MetricCard.vue'
import BottomNavigation from './components/BottomNavigation.vue'
import SosBreathingModal from './components/SosBreathingModal.vue'
import CravingSheet from './components/CravingSheet.vue'
import HealthMilestoneItem from './components/HealthMilestoneItem.vue'
import { useTrackerStore } from './stores/tracker'
import { impact, notify } from './telegram'
import type { CravingContext, UserProfile } from './types'

const store = useTrackerStore()
const tab = ref('home'), sosOpen = ref(false), cravingOpen = ref(false), slipOpen = ref(false), settingsOpen = ref(false)
const dateLocal = ref(new Date().toISOString().slice(0, 16)), cigarettes = ref(15), packPrice = ref(220), packCount = ref(20)
const slipCount = ref(1), slipReason = ref('')
const profile = computed(() => store.profile)
const currency = computed(() => profile.value?.currency ?? '₽')
const formatMoney = (value: number) => `${Math.floor(value).toLocaleString('ru-RU')} ${currency.value}`
const dailySaving = computed(() => profile.value ? profile.value.cigarettesPerDay * profile.value.pricePerPack / profile.value.cigarettesInPack : 0)
const monthlySaving = computed(() => dailySaving.value * 30)
const saveProfile = () => { store.setProfile({ quitDate: new Date(dateLocal.value).toISOString(), cigarettesPerDay: Math.max(1, cigarettes.value), pricePerPack: Math.max(1, packPrice.value), cigarettesInPack: Math.max(1, packCount.value), currency: '₽' }); notify('success') }
const logSlip = () => { if (slipReason.value.trim()) { store.logSlip(Math.max(1, slipCount.value), slipReason.value); slipReason.value = ''; slipOpen.value = false; notify('warning') } }
const saveCraving = (context: CravingContext, intensity: 1 | 2 | 3 | 4 | 5, note: string) => { store.logCraving(context, intensity, note); cravingOpen.value = false; notify('success') }
const milestones = [
  { time: 20 / 60, title: '20 минут', description: 'Пульс начинает возвращаться к обычному уровню.' },
  { time: 8, title: '8 часов', description: 'Уровень угарного газа заметно снижается, кислород восстанавливается.' },
  { time: 24, title: '24 часа', description: 'Никотин в крови снижается до нуля; риск сердечного приступа начинает падать.' },
  { time: 48, title: '48 часов', description: 'Организм очищается от CO; вкус и обоняние могут стать ярче.' },
  { time: 72, title: '72 часа', description: 'Бронхи начинают расслабляться — дышать и двигаться становится легче.' },
  { time: 24 * 14, title: '2 недели', description: 'Кровообращение улучшается, нагрузка переносится увереннее.' },
  { time: 24 * 90, title: '3 месяца', description: 'Функция лёгких и выносливость продолжают улучшаться.' },
  { time: 24 * 270, title: '9 месяцев', description: 'Кашель и одышка обычно становятся реже; дыхательные пути восстанавливаются.' },
  { time: 24 * 365, title: '1 год', description: 'Дополнительный риск ишемической болезни сердца примерно вдвое ниже, чем при курении.' },
  { time: 24 * 365 * 5, title: '5 лет', description: 'Снижается риск инсульта; уменьшается дополнительный риск ряда видов рака.' },
  { time: 24 * 365 * 10, title: '10 лет', description: 'Дополнительный риск смерти от рака лёгкого примерно вдвое ниже, чем при курении.' },
  { time: 24 * 365 * 15, title: '15 лет', description: 'Риск ишемической болезни сердца приближается к риску некурящего человека.' }
]
const milestoneProgress = (hours: number) => Math.min(100, Math.floor(store.elapsedMs / 3_600_000 / hours * 100))
const contextText = (context: CravingContext) => {
  const labels: Record<string, string> = { work: 'Работа', home: 'Дом', street: 'Улица', car: 'Машина', bar: 'Бар', stress: 'Стресс', boredom: 'Скука', after_meal: 'После еды', coffee_alcohol: 'Кофе / алкоголь' }
  return labels[context.location || context.emotion || ''] || 'Тяга'
}
const historyEvents = computed(() => [
  ...store.data.cravings.map(log => ({ id: `craving-${log.id}`, type: 'craving' as const, timestamp: log.timestamp, title: contextText(log.triggerContext), subtitle: `Сила ${log.intensity}/5`, note: log.note, context: log.triggerContext })),
  ...store.data.slips.map(log => ({ id: `slip-${log.id}`, type: 'slip' as const, timestamp: log.timestamp, title: 'Отмечен эпизод', subtitle: `${log.count} ${log.count === 1 ? 'сигарета' : 'сигарет(ы)'}`, note: log.reason, context: null }))
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
</script>

<template>
  <main v-if="!profile" class="onboarding"><section class="onboarding-content"><div class="onboarding-mark"><CigaretteOff :size="34"/></div><h1>Давай начнём</h1><p>Несколько деталей — и SmokeFree будет считать твой прогресс.</p><section class="form-card"><label class="field"><span>Последняя сигарета</span><input v-model="dateLocal" type="datetime-local"/></label><label class="field"><span>Сколько сигарет в день?</span><input v-model.number="cigarettes" type="number" min="1" inputmode="numeric"/></label><div class="field-row"><label class="field"><span>Цена пачки</span><input v-model.number="packPrice" type="number" min="1" inputmode="numeric"/></label><label class="field"><span>Сигарет в пачке</span><input v-model.number="packCount" type="number" min="1" inputmode="numeric"/></label></div><button class="primary" @click="saveProfile"><Heart :size="19"/> Начать новую жизнь</button></section></section></main>
  <main v-else class="app-shell">
    <AppHeader :title="tab === 'home' ? 'Сегодня без дыма' : ({ health: 'Здоровье', finance: 'Финансы', history: 'История' }[tab] || '')" @settings="settingsOpen = true"/>
    <section v-if="tab === 'home'" class="page">
      <TimeCounter :elapsed="store.elapsedMs"/><div class="metrics"><MetricCard :value="formatMoney(store.moneySaved)" label="сэкономлено" tone="green"/><MetricCard :value="Math.floor(store.cigarettesNotSmoked).toLocaleString('ru-RU')" label="не выкурено" tone="blue"/><MetricCard :value="`${store.smokeFreeRatio}%`" label="чистых дней" tone="purple"/></div>
      <button class="sos-button" @click="sosOpen = true; impact('medium')"><span><b>Тянет курить?</b><small>Побудь с собой 3 минуты</small></span><Wind :size="29"/></button>
      <div class="action-row"><button class="quick-action" @click="cravingOpen = true; impact()"><Flame :size="19"/>Записать тягу</button><button class="quick-action muted-action" @click="slipOpen = true; impact('light')"><AlertTriangle :size="18"/>Я оступился</button></div>
      
    </section>
    <section v-else-if="tab === 'health'" class="page"><p class="page-intro">Тело восстанавливается поэтапно. Прогресс основан на сроке без сигарет; результаты индивидуальны.</p><div class="group-list health-list"><HealthMilestoneItem v-for="m in milestones" :key="m.title" :title="m.title" :description="m.description" :progress="milestoneProgress(m.time)" :complete="milestoneProgress(m.time) >= 100"/></div><p class="health-source">Сроки: CDC и NHS. Это справочная информация, не медицинская консультация.</p></section>
    <section v-else-if="tab === 'finance'" class="page finance-page"><section class="finance-hero"><span class="finance-icon"><BadgeDollarSign :size="25"/></span><p>УЖЕ СОХРАНЕНО</p><b>{{ formatMoney(store.moneySaved) }}</b><small>Деньги остаются у тебя — один день за другим.</small></section><div class="finance-grid"><article><TrendingUp :size="20"/><span>В день</span><b>{{ formatMoney(dailySaving) }}</b></article><article><CalendarDays :size="20"/><span>За 30 дней</span><b>{{ formatMoney(monthlySaving) }}</b></article><article><ReceiptText :size="20"/><span>Не выкурено</span><b>{{ Math.floor(store.cigarettesNotSmoked).toLocaleString('ru-RU') }}</b></article></div><section class="finance-note"><b>Твоя новая привычка уже окупается</b><p>Продолжай отмечать тяги: это помогает видеть, как часто ты выбираешь себя вместо сигареты.</p></section></section>
    <section v-else class="page"><p class="page-intro">Здесь собраны все важные моменты пути — и тяги, и эпизоды. Это дневник наблюдений, а не оценка.</p><div v-if="historyEvents.length" class="group-list"><article v-for="event in historyEvents" :key="event.id" class="history-row" :class="event.type"><div class="history-icon"><BriefcaseBusiness v-if="event.type === 'craving' && event.context?.location === 'work'"/><Coffee v-else-if="event.type === 'craving' && event.context?.emotion === 'coffee_alcohol'"/><Wind v-else-if="event.type === 'craving'"/><AlertTriangle v-else/></div><div><b>{{ event.title }}</b><p>{{ new Date(event.timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }} · {{ event.subtitle }}</p><small v-if="event.note">{{ event.note }}</small></div></article></div><div v-else class="empty-state"><Wind :size="32"/><p>Пока нет записей. Это отличное начало.</p></div></section>
    <BottomNavigation :active="tab" @change="(next) => { tab = next; impact() }"/>
  </main>
  <SosBreathingModal v-if="sosOpen" @close="(completed) => { sosOpen = false; if (completed) notify('success') }"/><Transition name="sheet-slide"><CravingSheet v-if="cravingOpen" @close="cravingOpen = false" @save="saveCraving"/></Transition>
  <Transition name="sheet-slide"><div v-if="slipOpen" class="sheet-backdrop" @click.self="slipOpen = false"><section class="sheet slip-sheet"><div class="sheet-handle"/><div class="sheet-title"><h2>Ты не начал с нуля</h2><button @click="slipOpen = false">×</button></div><p class="muted">Один эпизод не отменяет твой путь. Отметь его, чтобы лучше понимать триггеры.</p><label>Сколько сигарет?</label><input v-model.number="slipCount" class="text-input" type="number" min="1" inputmode="numeric"/><label>Что спровоцировало?</label><input v-model="slipReason" class="text-input" placeholder="Например, стресс или компания"/><button class="primary" @click="logSlip">Записать бережно</button></section></div></Transition>
  <div v-if="settingsOpen" class="modal-backdrop"><section class="dialog"><h2>Настройки</h2><p class="muted">Удаление сотрёт профиль, историю и финансы с устройства.</p><button class="danger-button" @click="store.resetAllData(); settingsOpen = false; notify('warning')">Сбросить все данные</button><button class="text-button" @click="settingsOpen = false">Закрыть</button></section></div>
</template>