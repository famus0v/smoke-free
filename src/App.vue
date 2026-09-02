<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, Plus, Wind, CigaretteOff, Trophy, BriefcaseBusiness, Coffee, Heart } from 'lucide-vue-next'
import AppHeader from './components/AppHeader.vue'
import TimeCounter from './components/TimeCounter.vue'
import MetricCard from './components/MetricCard.vue'
import BottomNavigation from './components/BottomNavigation.vue'
import SosBreathingModal from './components/SosBreathingModal.vue'
import CravingSheet from './components/CravingSheet.vue'
import HealthMilestoneItem from './components/HealthMilestoneItem.vue'
import WishlistCard from './components/WishlistCard.vue'
import { useTrackerStore } from './stores/tracker'
import { impact, notify } from './telegram'
import type { CravingContext, UserProfile } from './types'

const store = useTrackerStore()
const tab = ref('home'), sosOpen = ref(false), cravingOpen = ref(false), slipOpen = ref(false), wishOpen = ref(false), settingsOpen = ref(false)
const dateLocal = ref(new Date().toISOString().slice(0, 16)), cigarettes = ref(15), packPrice = ref(220), packCount = ref(20)
const wishTitle = ref(''), wishCost = ref<number | null>(null), slipCount = ref(1), slipReason = ref('')
const profile = computed(() => store.profile)
const currency = computed(() => profile.value?.currency ?? '₽')
const formatMoney = (v: number) => `${Math.floor(v).toLocaleString('ru-RU')} ${currency.value}`
const saveProfile = () => { store.setProfile({ quitDate: new Date(dateLocal.value).toISOString(), cigarettesPerDay: Math.max(1, cigarettes.value), pricePerPack: Math.max(1, packPrice.value), cigarettesInPack: Math.max(1, packCount.value), currency: '₽' }); notify('success') }
const addWish = () => { if (wishTitle.value.trim() && wishCost.value && wishCost.value > 0) { store.addWishlistItem(wishTitle.value, wishCost.value); wishTitle.value = ''; wishCost.value = null; wishOpen.value = false; notify('success') } }
const logSlip = () => { if (slipReason.value.trim()) { store.logSlip(Math.max(1, slipCount.value), slipReason.value); slipReason.value = ''; slipOpen.value = false; notify('warning') } }
const saveCraving = (context: CravingContext, intensity: 1|2|3|4|5, note: string) => { store.logCraving(context, intensity, note); cravingOpen.value = false; notify('success') }
const milestones = [{ time: 20/60, title: '20 минут', description: 'Пульс и давление приходят в норму' }, { time: 12, title: '12 часов', description: 'Уровень CO в крови в норме' }, { time: 48, title: '48 часов', description: 'Возвращаются вкус и обоняние' }, { time: 72, title: '72 часа', description: 'Дышать становится легче' }, { time: 24*14, title: '2 недели', description: 'Улучшается кровообращение' }, { time: 24*30, title: '1 месяц', description: 'Лёгкие восстанавливаются' }, { time: 24*90, title: '3 месяца', description: 'Больше энергии каждый день' }, { time: 24*365, title: '1 год', description: 'Риск болезней сердца снижен вдвое' }]
const milestoneProgress = (hours: number) => Math.min(100, Math.floor(store.elapsedMs / 3_600_000 / hours * 100))
const contextText = (c: CravingContext) => {
  const labels: Record<string, string> = { work: 'Работа', home: 'Дом', street: 'Улица', car: 'Машина', bar: 'Бар', stress: 'Стресс', boredom: 'Скука', after_meal: 'После еды', coffee_alcohol: 'Кофе' }
  return labels[c.location || c.emotion || ''] || 'Тяга'
}
</script>

<template>
  <main v-if="!profile" class="onboarding"><div class="onboarding-mark"><CigaretteOff :size="34"/></div><h1>Давай начнём</h1><p>Несколько деталей — и SmokeFree будет считать твой прогресс.</p><section class="form-card"><label>Последняя сигарета</label><input v-model="dateLocal" type="datetime-local"/><label>Сколько сигарет в день?</label><input v-model.number="cigarettes" type="number" min="1"/><label>Цена пачки</label><input v-model.number="packPrice" type="number" min="1"/><label>Сигарет в пачке</label><input v-model.number="packCount" type="number" min="1"/><button class="primary" @click="saveProfile"><Heart :size="19"/> Начать новую жизнь</button></section></main>
  <main v-else class="app-shell">
    <AppHeader :title="tab === 'home' ? 'Сегодня без дыма' : ({ health: 'Здоровье', goals: 'Мои цели', history: 'История' }[tab] || '')" @settings="settingsOpen = true"/>
    <section v-if="tab === 'home'" class="page">
      <TimeCounter :elapsed="store.elapsedMs"/>
      <div class="metrics"><MetricCard :value="formatMoney(store.moneySaved)" label="сэкономлено" tone="green"/><MetricCard :value="Math.floor(store.cigarettesNotSmoked).toLocaleString('ru-RU')" label="не выкурено" tone="blue"/><MetricCard :value="`${store.smokeFreeRatio}%`" label="чистых дней" tone="purple"/></div>
      <button class="sos-button" @click="sosOpen = true; impact('medium')"><span><b>Тянет курить?</b><small>Побудь с собой 3 минуты</small></span><Wind :size="29"/></button>
      <div class="action-row"><button class="quick-action" @click="cravingOpen = true; impact()"><Plus :size="20"/>Записать тягу</button><button class="quick-action muted-action" @click="slipOpen = true"><AlertTriangle :size="18"/>Я оступился</button></div>
      <section class="insight"><Trophy :size="21"/><div><b>Каждая тяга проходит</b><p>Не нужно побеждать навсегда. Достаточно не курить сейчас.</p></div></section>
    </section>
    <section v-else-if="tab === 'health'" class="page"><p class="page-intro">Тело уже восстанавливается. Каждая отметка — реальный шаг к здоровью.</p><div class="group-list"><HealthMilestoneItem v-for="m in milestones" :key="m.title" :title="m.title" :description="m.description" :progress="milestoneProgress(m.time)" :complete="milestoneProgress(m.time) >= 100"/></div></section>
    <section v-else-if="tab === 'goals'" class="page"><section class="saving-card"><p>СЭКОНОМЛЕНО</p><b>{{ formatMoney(store.moneySaved) }}</b><span>из {{ formatMoney(store.totalWishlistCost) }} в планах</span><div class="progress"><i :style="{ width: `${Math.min(100, store.totalWishlistCost ? store.moneySaved / store.totalWishlistCost * 100 : 0)}%` }"/></div></section><div class="section-heading"><h2>Список желаний</h2><button class="add-mini" @click="wishOpen = true"><Plus :size="18"/>Добавить</button></div><div v-if="store.wishlist.length" class="group-list"><WishlistCard v-for="item in store.wishlist" :key="item.id" :title="item.title" :cost="item.cost" :saved="store.moneySaved" :currency="currency" :unlocked="item.isUnlocked"/></div><div v-else class="empty-state"><Trophy :size="32"/><p>Добавь первую цель — и увидишь, ради чего копишь.</p></div></section>
    <section v-else class="page"><p class="page-intro">Зафиксированные моменты. Наблюдение за триггерами делает тебя сильнее.</p><div v-if="store.data.cravings.length" class="group-list"><article v-for="log in store.data.cravings" :key="log.id" class="history-row"><div class="history-icon"><BriefcaseBusiness v-if="log.triggerContext.location === 'work'"/><Coffee v-else-if="log.triggerContext.emotion === 'coffee_alcohol'"/><AlertTriangle v-else/></div><div><b>{{ contextText(log.triggerContext) }}</b><p>{{ new Date(log.timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }} · сила {{ log.intensity }}/5</p><small v-if="log.note">{{ log.note }}</small></div></article></div><div v-else class="empty-state"><Wind :size="32"/><p>Пока нет записей. Это отличное начало.</p></div></section>
    <BottomNavigation :active="tab" @change="(next) => { tab = next; impact() }"/>
  </main>
  <SosBreathingModal v-if="sosOpen" @close="(completed) => { sosOpen = false; if (completed) notify('success') }"/>
  <CravingSheet v-if="cravingOpen" @close="cravingOpen = false" @save="saveCraving"/>
  <div v-if="wishOpen || slipOpen || settingsOpen" class="modal-backdrop"><section class="dialog"><template v-if="wishOpen"><h2>Новая цель</h2><input v-model="wishTitle" class="text-input" placeholder="Например, кроссовки"/><input v-model.number="wishCost" class="text-input" type="number" min="1" placeholder="Стоимость, ₽"/><button class="primary" @click="addWish">Добавить</button><button class="text-button" @click="wishOpen = false">Отмена</button></template><template v-else-if="slipOpen"><h2>Ты не начал с нуля</h2><p class="muted">Один эпизод не отменяет твой путь. Отметь его, чтобы лучше понимать триггеры.</p><input v-model.number="slipCount" class="text-input" type="number" min="1" placeholder="Количество сигарет"/><input v-model="slipReason" class="text-input" placeholder="Что спровоцировало?"/><button class="primary" @click="logSlip">Записать бережно</button><button class="text-button" @click="slipOpen = false">Отмена</button></template><template v-else><h2>Настройки</h2><p class="muted">Удаление сотрёт профиль, историю и цели с устройства.</p><button class="danger-button" @click="store.resetAllData(); settingsOpen = false; notify('warning')">Сбросить все данные</button><button class="text-button" @click="settingsOpen = false">Закрыть</button></template></section></div>
</template>
