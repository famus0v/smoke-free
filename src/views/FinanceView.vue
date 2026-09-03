<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Utensils, Dumbbell, Home, Sparkles, WalletCards, ReceiptText, Landmark, Repeat2, BellRing, Trash2, Delete, RotateCcw } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'
import type { DebtDirection, ExpenseCategory, SubscriptionCadence } from '@/types'

type FinanceSection = 'today' | 'history' | 'debts' | 'subscriptions'
const store = useAppStore()
const section = ref<FinanceSection>('today')
const smartEntry = ref('')
const category = ref<ExpenseCategory>('food')
const debtTitle = ref('')
const debtAmount = ref<number | null>(null)
const debtDueDate = ref('')
const subscriptionTitle = ref('')
const subscriptionAmount = ref<number | null>(null)
const subscriptionDay = ref<number | null>(1)
const subscriptionMonth = ref<number | null>(new Date().getMonth() + 1)
const debtDirection = ref<DebtDirection>('i_owe')
const subscriptionCadence = ref<SubscriptionCadence>('monthly')
const debtSheetOpen = ref(false)
const subscriptionSheetOpen = ref(false)
const categories = [
  { id: 'food' as const, label: 'Еда', icon: Utensils, color: '#ff9f0a' },
  { id: 'sport' as const, label: 'Спорт', icon: Dumbbell, color: '#30d158' },
  { id: 'fixed' as const, label: 'Обяз.', icon: Home, color: '#0a84ff' },
  { id: 'fun' as const, label: 'Радость', icon: Sparkles, color: '#bf5af2' },
]
const titles: Record<FinanceSection, string> = { today: 'Можно потратить', history: 'История трат', debts: 'Долги', subscriptions: 'Подписки' }
const money = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
const todayKey = () => new Date().toISOString().slice(0, 10)
const spentToday = computed(() => store.state.finance.expenses.filter((expense) => expense.date.startsWith(todayKey())).reduce((sum, expense) => sum + expense.amount, 0))
const smartDraft = computed(() => {
  const raw = smartEntry.value.trim()
  const expression = raw.match(/^[\d\s+.,]+/)?.[0] ?? ''
  const values = expression.replace(/,/g, '.').split('+').map((part) => Number(part.trim())).filter((value) => Number.isFinite(value))
  return { amount: values.reduce((sum, value) => sum + value, 0), note: raw.slice(expression.length).trim(), expression: expression.trim() }
})
const projectedSpent = computed(() => spentToday.value + smartDraft.value.amount)
const remainingToday = computed(() => store.todayLimit - projectedSpent.value)
const risk = computed<'safe' | 'warning' | 'overdraft'>(() => remainingToday.value < 0 ? 'overdraft' : projectedSpent.value / Math.max(store.todayLimit, 1) >= .7 ? 'warning' : 'safe')
const progress = computed(() => Math.min(100, Math.max(0, projectedSpent.value / Math.max(store.todayLimit, 1) * 100)))
const nextDays = computed(() => [1, 2, 3].map((offset) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const daysAfterTarget = Math.max(1, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1 - offset)
  const limit = Math.max(0, (store.state.finance.monthlyBudget - store.monthExpenses - smartDraft.value.amount) / daysAfterTarget)
  return { label: offset === 1 ? 'Завтра' : date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), limit }
}))
const historyGroups = computed(() => {
  type Expense = (typeof store.state.finance.expenses)[number]
  const groups = new Map<string, { date: string; expenses: Expense[]; total: number }>()
  store.state.finance.expenses.forEach((expense) => {
    const date = expense.date.slice(0, 10)
    const group = groups.get(date) ?? { date, expenses: [], total: 0 }
    group.expenses.push(expense)
    group.total += expense.amount
    groups.set(date, group)
  })
  return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date))
})
const historyDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }).toUpperCase()
const categoryInfo = (id: ExpenseCategory) => categories.find((item) => item.id === id) ?? categories[0]
const swipeOffsets = ref<Record<string, number>>({})
let swipeStartX = 0
let swipingId = ''
const beginSwipe = (event: TouchEvent, id: string) => { swipeStartX = event.touches[0]?.clientX ?? 0; swipingId = id }
const moveSwipe = (event: TouchEvent, id: string) => {
  if (swipingId !== id) return
  const delta = (event.touches[0]?.clientX ?? swipeStartX) - swipeStartX
  swipeOffsets.value[id] = Math.max(-88, Math.min(0, delta))
}
const endSwipe = (id: string) => { swipeOffsets.value[id] = (swipeOffsets.value[id] ?? 0) < -42 ? -76 : 0; swipingId = '' }
const deleteExpense = (id: string) => { store.removeExpense(id); delete swipeOffsets.value[id]; haptic('medium') }
const subscriptionMonthlyCost = (subscription: typeof store.state.finance.subscriptions[number]) => subscription.cadence === 'yearly' ? subscription.amount / 12 : subscription.amount
const subscriptionDailyCost = (subscription: typeof store.state.finance.subscriptions[number]) => subscription.cadence === 'yearly' ? subscription.amount / 365 : subscription.amount / 30
const daysUntilBilling = (subscription: typeof store.state.finance.subscriptions[number]) => {
  const now = new Date()
  const day = Math.min(subscription.billingDay, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
  if (subscription.cadence === 'monthly') return day >= now.getDate() ? day - now.getDate() : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + day
  const month = (subscription.billingMonth ?? now.getMonth() + 1) - 1
  const next = new Date(now.getFullYear(), month, Math.min(subscription.billingDay, new Date(now.getFullYear(), month + 1, 0).getDate()))
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(next.getFullYear() + 1)
  return Math.ceil((next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000)
}
const activeSubscriptions = computed(() => store.state.finance.subscriptions.filter((subscription) => subscription.active))
const sortedSubscriptions = computed(() => [...store.state.finance.subscriptions].sort((a, b) => daysUntilBilling(a) - daysUntilBilling(b)))
const monthlyBurn = computed(() => activeSubscriptions.value.reduce((sum, subscription) => sum + subscriptionMonthlyCost(subscription), 0))
const dailyBurn = computed(() => activeSubscriptions.value.reduce((sum, subscription) => sum + subscriptionDailyCost(subscription), 0))
const upcomingSubscriptions = computed(() => sortedSubscriptions.value.filter((subscription) => subscription.active && daysUntilBilling(subscription) <= 2))
const billingText = (subscription: typeof store.state.finance.subscriptions[number]) => { const days = daysUntilBilling(subscription); return days === 0 ? 'спишется сегодня' : days === 1 ? 'спишется завтра' : `спишется через ${days} дня` }
const filteredDebts = computed(() => store.state.finance.debts.filter((debt) => debt.direction === debtDirection.value))
const debtTotal = computed(() => filteredDebts.value.reduce((sum, debt) => sum + debt.amount, 0))
const subscriptionMeta = (subscription: typeof store.state.finance.subscriptions[number]) => {
  if (!subscription.active) return 'На паузе'
  return `${billingText(subscription)} · ${subscription.cadence === 'yearly' ? 'раз в год' : 'ежемесячно'}`
}
const setSection = (value: FinanceSection) => { section.value = value; haptic('light') }
const appendKey = (key: string) => {
  const current = smartDraft.value
  const expression = current.expression
  if (key === '+' && (!expression || expression.endsWith('+'))) return
  smartEntry.value = `${expression}${key}${current.note ? ` ${current.note}` : ''}`
  haptic('light')
}
const quickAdd = (value: number) => {
  const current = smartDraft.value
  smartEntry.value = `${current.expression ? `${current.expression}+` : ''}${value}${current.note ? ` ${current.note}` : ''}`
  haptic('light')
}
const clearEntry = () => { smartEntry.value = ''; haptic('light') }
const backspaceEntry = () => { smartEntry.value = smartEntry.value.slice(0, -1); haptic('light') }
const addExpense = () => {
  if (smartDraft.value.amount <= 0) { notify('error'); return }
  store.addExpense(smartDraft.value.amount, category.value, smartDraft.value.note || undefined)
  smartEntry.value = ''
  notify('success')
}
const addDebt = () => { if (!store.addDebt(debtTitle.value, Number(debtAmount.value), debtDirection.value, debtDueDate.value || undefined)) { notify('error'); return }; debtTitle.value = ''; debtAmount.value = null; debtDueDate.value = ''; debtSheetOpen.value = false; notify('success') }
const addSubscription = () => { if (!store.addSubscription(subscriptionTitle.value, Number(subscriptionAmount.value), Number(subscriptionDay.value), subscriptionCadence.value, subscriptionCadence.value === 'yearly' ? Number(subscriptionMonth.value) : undefined)) { notify('error'); return }; subscriptionTitle.value = ''; subscriptionAmount.value = null; subscriptionDay.value = 1; subscriptionMonth.value = new Date().getMonth() + 1; subscriptionCadence.value = 'monthly'; subscriptionSheetOpen.value = false; notify('success') }
</script>

<template>
  <section class="screen finance-screen">
    <p class="eyebrow">Ваш бюджет</p>
    <h1 class="screen-title">{{ titles[section] }}</h1>
    <div class="module-tabs finance-tabs"><button :class="{ active: section === 'today' }" @click="setSection('today')">Сегодня</button><button :class="{ active: section === 'history' }" @click="setSection('history')">История</button><button :class="{ active: section === 'debts' }" @click="setSection('debts')">Долги</button><button :class="{ active: section === 'subscriptions' }" @click="setSection('subscriptions')">Подписки</button></div>

    <div v-if="section === 'today'" class="module-content">
      <section class="finance-hero budget-hero" :class="`risk-${risk}`">
        <span class="finance-hero-icon"><WalletCards :size="25" /></span>
        <p>{{ remainingToday >= 0 ? 'ОСТАЛОСЬ СЕГОДНЯ' : 'ПЕРЕРАСХОД' }}</p>
        <b v-if="remainingToday >= 0">Осталось {{ money(remainingToday) }} <small>{{ store.state.finance.currency }}</small></b>
        <b v-else>Перерасход: −{{ money(Math.abs(remainingToday)) }} <small>{{ store.state.finance.currency }}</small></b>
        <div class="hero-progress"><i :style="{ width: `${progress}%` }" /></div>
        <span>Потрачено {{ money(projectedSpent) }} из {{ money(store.todayLimit) }} {{ store.state.finance.currency }}</span>
      </section>
      <section class="card future-limits"><div class="future-title"><span>{{ smartDraft.amount ? 'После этой покупки' : 'Лимит на следующие дни' }}</span><b>{{ money(nextDays[0]?.limit ?? store.futureDailyLimit) }} {{ store.state.finance.currency }} / день</b></div><p v-if="smartDraft.amount" class="projection-copy">Купишь это сейчас — завтра будет {{ money(nextDays[0].limit) }} {{ store.state.finance.currency }}.</p><div class="future-days"><div v-for="day in nextDays" :key="day.label"><small>{{ day.label }}</small><b>{{ money(day.limit) }} {{ store.state.finance.currency }}</b></div></div></section>
      <h2 class="section-title">Быстрый расход</h2>
      <div class="card expense-form">
        <div class="smart-display"><input v-model="smartEntry" class="smart-entry" inputmode="text" placeholder="250+120 такси" aria-label="Сумма и комментарий" /><button v-if="smartEntry" aria-label="Очистить" @click="clearEntry"><RotateCcw :size="17" /></button></div>
        <p class="smart-hint">{{ smartDraft.amount ? `${money(smartDraft.amount)} ${store.state.finance.currency}${smartDraft.note ? ` · ${smartDraft.note}` : ''}` : 'Например: 250+120 такси' }}</p>
        <div class="quick-add"><button v-for="value in [100, 500, 1000]" :key="value" @click="quickAdd(value)">+{{ value }}</button></div>
        <div class="numpad"><button v-for="key in ['1','2','3','4','5','6','7','8','9','+','0']" :key="key" @click="appendKey(key)">{{ key }}</button><button aria-label="Удалить цифру" @click="backspaceEntry"><Delete :size="20" /></button></div>
        <div class="category-grid"><button v-for="item in categories" :key="item.id" :class="{ active: category === item.id }" @click="category = item.id; haptic('light')"><span :style="{ background: item.color }"><component :is="item.icon" :size="17" /></span><small>{{ item.label }}</small></button></div>
        <button class="primary-btn add" @click="addExpense"><Plus :size="18" /> Записать расход</button>
      </div>
    </div>

    <div v-else-if="section === 'history'" class="module-content history-page">
      <div v-if="!historyGroups.length" class="card empty"><ReceiptText :size="28" /><span>Расходов пока нет</span></div>
      <section v-for="group in historyGroups" :key="group.date" class="history-group">
        <div class="history-date"><span><i :class="{ danger: group.total > store.todayLimit }" />{{ historyDate(group.date) }}</span><b>−{{ money(group.total) }} {{ store.state.finance.currency }}</b></div>
        <div class="card history-list">
          <div v-for="expense in group.expenses" :key="expense.id" class="swipe-shell">
            <button class="swipe-delete" aria-label="Удалить расход" @click="deleteExpense(expense.id)"><Trash2 :size="18" /><span>Удалить</span></button>
            <article class="row transaction swipe-row" :style="{ transform: `translateX(${swipeOffsets[expense.id] ?? 0}px)` }" @touchstart="beginSwipe($event, expense.id)" @touchmove.prevent="moveSwipe($event, expense.id)" @touchend="endSwipe(expense.id)">
              <span class="category-icon" :style="{ background: `${categoryInfo(expense.category).color}22`, color: categoryInfo(expense.category).color }"><component :is="categoryInfo(expense.category).icon" :size="17" /></span>
              <span class="transaction-copy"><b>{{ categoryInfo(expense.category).label }}</b><small>{{ expense.note || 'Без комментария' }}</small></span>
              <b>−{{ money(expense.amount) }} {{ store.state.finance.currency }}</b>
            </article>
          </div>
        </div>
      </section>
    </div>

    <div v-else-if="section === 'debts'" class="module-content">
      <section class="debt-hero"><Landmark :size="23" /><div><span>{{ debtDirection === 'owed_to_me' ? 'Мне должны' : 'Я должен' }}</span><b>{{ money(debtTotal) }} {{ store.state.finance.currency }}</b></div></section>
      <div class="debt-switch"><button :class="{ active: debtDirection === 'owed_to_me' }" @click="debtDirection = 'owed_to_me'; haptic('light')">Мне должны</button><button :class="{ active: debtDirection === 'i_owe' }" @click="debtDirection = 'i_owe'; haptic('light')">Я должен</button></div>
      <button class="add-inline" @click="debtSheetOpen = true; haptic('light')"><Plus :size="18" /> Добавить долг</button>
      <div class="card debt-list"><div v-if="!filteredDebts.length" class="empty"><Landmark :size="28" /><span>{{ debtDirection === 'owed_to_me' ? 'Вам пока никто не должен' : 'Долгов нет' }}</span></div><div v-for="debt in filteredDebts" :key="debt.id" class="swipe-shell"><button class="swipe-delete" aria-label="Удалить долг" @click="store.removeDebt(debt.id); haptic('medium')"><Trash2 :size="18" /><span>Удалить</span></button><article class="row debt-row swipe-row" :style="{ transform: `translateX(${swipeOffsets[debt.id] ?? 0}px)` }" @touchstart="beginSwipe($event, debt.id)" @touchmove.prevent="moveSwipe($event, debt.id)" @touchend="endSwipe(debt.id)"><span><b>{{ debt.title }}</b><small>{{ debt.dueDate ? `Срок: ${new Date(debt.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}` : 'Срок не указан' }}</small></span><b>{{ money(debt.amount) }} {{ store.state.finance.currency }}</b></article></div></div>
    </div>

    <div v-else class="module-content"><section class="burn-hero"><Repeat2 :size="23" /><div><span>Фиксированная стоимость жизни</span><b>{{ money(dailyBurn) }} {{ store.state.finance.currency }} <small>/ день</small></b><small>{{ money(monthlyBurn) }} {{ store.state.finance.currency }} / месяц</small></div></section><section v-if="upcomingSubscriptions.length" class="reminder"><BellRing :size="19" /><p><b>{{ upcomingSubscriptions[0].title }}</b> {{ billingText(upcomingSubscriptions[0]) }}. Ты ещё пользуешься сервисом?</p></section><button class="add-inline subscription-add" @click="subscriptionSheetOpen = true; haptic('light')"><Plus :size="18" /> Добавить подписку</button><h2 class="section-title">Все сервисы</h2><div class="card subscription-list"><div v-for="subscription in sortedSubscriptions" :key="subscription.id" class="swipe-shell"><button class="swipe-delete" aria-label="Удалить подписку" @click="store.removeSubscription(subscription.id); haptic('medium')"><Trash2 :size="18" /><span>Удалить</span></button><article class="row subscription-row swipe-row" :style="{ transform: `translateX(${swipeOffsets[subscription.id] ?? 0}px)` }" @touchstart="beginSwipe($event, subscription.id)" @touchmove.prevent="moveSwipe($event, subscription.id)" @touchend="endSwipe(subscription.id)"><button class="subscription-switch" :class="{ active: subscription.active }" :aria-label="subscription.active ? 'Поставить на паузу' : 'Возобновить подписку'" @click="subscription.active = !subscription.active; haptic('light')" /><span><b>{{ subscription.title }}</b><small>{{ subscriptionMeta(subscription) }}</small></span><b>{{ money(subscription.amount) }} {{ store.state.finance.currency }}<small>{{ subscription.cadence === 'yearly' ? '/ год' : '/ месяц' }}</small></b></article></div></div></div>
  </section>
  <Transition name="sheet-slide"><div v-if="debtSheetOpen" class="sheet-backdrop" @click.self="debtSheetOpen = false"><section class="sheet finance-sheet"><div class="sheet-handle" /><div class="sheet-title"><h2>Новый долг</h2><button @click="debtSheetOpen = false">×</button></div><div class="sheet-options"><button :class="{ active: debtDirection === 'owed_to_me' }" @click="debtDirection = 'owed_to_me'">Мне должны</button><button :class="{ active: debtDirection === 'i_owe' }" @click="debtDirection = 'i_owe'">Я должен</button></div><input v-model="debtTitle" class="app-input" placeholder="Кому или за что" /><label class="amount-field"><input v-model.number="debtAmount" class="app-input" type="number" inputmode="decimal" placeholder="Сумма" /><span>{{ store.state.finance.currency }}</span></label><input v-model="debtDueDate" class="app-input" type="date" /><button class="primary-btn add" @click="addDebt">Сохранить долг</button></section></div></Transition>
  <Transition name="sheet-slide"><div v-if="subscriptionSheetOpen" class="sheet-backdrop" @click.self="subscriptionSheetOpen = false"><section class="sheet finance-sheet"><div class="sheet-handle" /><div class="sheet-title"><h2>Новая подписка</h2><button @click="subscriptionSheetOpen = false">×</button></div><input v-model="subscriptionTitle" class="app-input" placeholder="Название сервиса" /><label class="amount-field"><input v-model.number="subscriptionAmount" class="app-input" type="number" inputmode="decimal" placeholder="Стоимость" /><span>{{ store.state.finance.currency }}</span></label><div class="sheet-options"><button :class="{ active: subscriptionCadence === 'monthly' }" @click="subscriptionCadence = 'monthly'">Каждый месяц</button><button :class="{ active: subscriptionCadence === 'yearly' }" @click="subscriptionCadence = 'yearly'">Раз в год</button></div><label class="billing-day"><span>День списания</span><input v-model.number="subscriptionDay" class="app-input" type="number" min="1" max="31" inputmode="numeric" /></label><label v-if="subscriptionCadence === 'yearly'" class="billing-day"><span>Месяц списания</span><input v-model.number="subscriptionMonth" class="app-input" type="number" min="1" max="12" inputmode="numeric" /></label><button class="primary-btn add" @click="addSubscription">Добавить подписку</button></section></div></Transition>
</template>

<style scoped>
.finance-screen{padding-bottom:calc(118px + env(safe-area-inset-bottom,0px))}.finance-tabs{margin-top:12px}.module-content{margin-top:13px}.budget-hero,.burn-hero{padding:18px;background:linear-gradient(135deg,#087fdc,#5ab1f4);box-shadow:0 4px 10px rgba(0,122,255,.16)}.budget-hero>p{margin:14px 0 4px;color:rgba(255,255,255,.76);font-size:11px;font-weight:750;letter-spacing:.75px}.budget-hero>b{display:block;color:#fff;font-size:32px;letter-spacing:-1px}.budget-hero>b small{font-size:17px;font-weight:650;opacity:.84}.budget-hero>span:last-child{display:block;margin-top:5px;color:rgba(255,255,255,.82);font-size:13px}.future-limits{margin-top:12px;padding:14px}.future-title{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.future-title span,.future-days small{color:var(--secondary);font-size:13px}.future-title b{font-size:13px}.future-days{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:13px}.future-days>div{padding:10px 7px;border-radius:10px;background:var(--pressed);text-align:center}.future-days small,.future-days b{display:block}.future-days small{font-size:11px}.future-days b{margin-top:3px;font-size:12px}.expense-form,.compact-form{padding:14px}.amount-field{display:flex;align-items:center;gap:8px}.amount-input{min-width:0;flex:1;font-size:28px;font-weight:750}.amount-field>input{min-width:0;flex:1}.amount-field span{color:var(--secondary);font-size:15px;white-space:nowrap}.note{width:100%;margin-top:8px}.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:13px 0}.category-grid button{padding:7px 1px;border:1px solid transparent;border-radius:10px;color:var(--secondary);background:transparent;display:grid;place-items:center;gap:4px}.category-grid button.active{border-color:var(--accent);color:var(--text);background:rgba(10,132,255,.08)}.category-grid button span{width:29px;height:29px;border-radius:8px;color:white;display:grid;place-items:center}.category-grid small{font-size:10px}.add{width:100%;display:flex;align-items:center;justify-content:center;gap:5px}.empty{min-height:105px;display:grid;place-items:center;align-content:center;gap:8px;color:var(--secondary);font-size:13px}.transaction span,.debt-row span,.subscription-row>span{display:grid;gap:3px;flex:1}.transaction small,.debt-row small,.subscription-row small{color:var(--secondary);font-size:12px}.transaction> b,.debt-row> b,.subscription-row> b{font-size:13px;white-space:nowrap}.debt-hero,.burn-hero{display:flex;align-items:flex-start;gap:12px;border-radius:16px;color:#fff}.debt-hero{padding:16px;background:linear-gradient(135deg,#f18b0b,#ffb340);box-shadow:0 4px 10px rgba(255,149,0,.16)}.debt-hero span,.burn-hero span{display:block;color:rgba(255,255,255,.8);font-size:12px}.debt-hero b,.burn-hero b{display:block;margin-top:3px;font-size:25px}.compact-form{display:grid;gap:8px;margin-top:12px}.billing-day{display:flex;align-items:center;gap:10px;color:var(--secondary);font-size:14px}.billing-day input{width:70px;margin-left:auto;text-align:center}.debt-row button,.subscription-row>button:last-child{display:grid;place-items:center;width:30px;height:30px;color:var(--tertiary);background:transparent}.burn-hero{background:linear-gradient(135deg,#7c3aed,#b76af2);box-shadow:0 4px 10px rgba(168,85,247,.16)}.burn-hero>div{display:grid;gap:2px}.burn-hero b{font-size:23px}.burn-hero b small,.burn-hero>div>small{color:rgba(255,255,255,.82);font-size:13px;font-weight:600}.reminder{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:13px;border-radius:14px;color:#865900;background:rgba(255,159,10,.16)}.reminder p{margin:0;font-size:13px;line-height:1.35}.subscription-form{margin-top:12px}.subscription-row{gap:9px}.subscription-switch{position:relative;width:36px;height:22px;flex:none;border-radius:12px;background:var(--tertiary);transition:background .18s ease}.subscription-switch::after{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;content:"";transition:transform .18s ease}.subscription-switch.active{background:var(--purple)}.subscription-switch.active::after{transform:translateX(14px)}
</style>
<style scoped>
.budget-hero{min-height:201px}.budget-hero.risk-warning{background:linear-gradient(135deg,#e98108,#ffb340);box-shadow:0 4px 10px rgba(255,149,0,.2)}.budget-hero.risk-overdraft{background:linear-gradient(135deg,#7b1d31,#c6364e);box-shadow:0 4px 10px rgba(160,31,57,.24)}.budget-hero .hero-progress{height:7px;margin:18px 0 8px;background:rgba(255,255,255,.24)}.budget-hero .hero-progress i{background:#fff}.projection-copy{margin:7px 0 -2px;color:var(--secondary);font-size:12px;line-height:1.35}.smart-display{display:flex;align-items:center;gap:7px;padding:0 10px;border-radius:12px;background:var(--pressed)}.smart-entry{min-width:0;flex:1;border:0!important;box-shadow:none!important;background:transparent!important;font-size:20px;font-weight:750}.smart-display button{display:grid;place-items:center;width:32px;height:32px;color:var(--secondary);background:transparent}.smart-hint{min-height:18px;margin:8px 2px 0;color:var(--secondary);font-size:12px}.quick-add{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}.quick-add button{min-height:35px;border-radius:10px;color:var(--accent);background:rgba(10,132,255,.1);font-size:13px;font-weight:750}.numpad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.numpad button{height:42px;border-radius:11px;color:var(--text);background:var(--pressed);font-size:18px;font-weight:650}.numpad button:active,.quick-add button:active{transform:scale(.96);background:var(--separator)}
</style>
<style scoped>
.history-page{display:grid;gap:18px}.history-group{display:grid;gap:7px}.history-date{display:flex;align-items:center;justify-content:space-between;padding:0 4px;color:var(--secondary);font-size:11px;font-weight:750;letter-spacing:.55px}.history-date span{display:flex;align-items:center;gap:7px}.history-date i{width:7px;height:7px;border-radius:50%;background:var(--green)}.history-date i.danger{background:#ff453a}.history-date b{color:var(--secondary);font-size:12px;letter-spacing:0}.history-list{overflow:hidden}.swipe-shell{position:relative;overflow:hidden}.swipe-shell+.swipe-shell{border-top:.5px solid var(--separator)}.swipe-delete{position:absolute;inset:0 0 0 auto;width:76px;color:#fff;background:#ff453a;display:grid;place-items:center;align-content:center;gap:2px;font-size:10px}.swipe-row{position:relative;z-index:1;min-height:64px;background:var(--card);transition:transform .18s ease;touch-action:pan-y}.transaction{gap:10px}.transaction .category-icon{width:32px;height:32px;flex:none;border-radius:8px;display:grid;place-items:center}.transaction-copy{display:grid;gap:3px;flex:1}.transaction-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.transaction> b{font-size:13px;white-space:nowrap}
</style>
<style scoped>
.budget-hero>b small{display:inline;vertical-align:baseline;line-height:1}.debt-switch{display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:12px;padding:3px;border-radius:13px;background:rgba(118,118,128,.14)}.debt-switch button{min-height:35px;border-radius:10px;color:var(--secondary);background:transparent;font-size:13px;font-weight:700}.debt-switch button.active{color:var(--text);background:var(--card);box-shadow:0 2px 8px rgba(0,0,0,.09)}.add-inline{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;min-height:48px;margin:12px 0;border-radius:14px;color:var(--accent);background:rgba(10,132,255,.1);font-weight:750}.debt-list,.subscription-list{overflow:hidden}.subscription-add{margin-bottom:0}.subscription-row>b{display:grid;gap:1px;text-align:right}.subscription-row>b small{font-size:10px;font-weight:500}.finance-sheet{display:grid;gap:10px}.finance-sheet .sheet-title{margin-bottom:2px}.finance-sheet .amount-field{background:var(--pressed);border-radius:12px;padding:0 11px}.finance-sheet .amount-field input{background:transparent}.finance-sheet .billing-day{padding:0 2px}.finance-sheet .sheet-options button{justify-content:center}
</style>
<style scoped>
.debt-list .swipe-row,.subscription-list .swipe-row{border-radius:0}.debt-list .swipe-shell:last-child .swipe-row,.subscription-list .swipe-shell:last-child .swipe-row{border-radius:0 0 16px 16px}.subscription-row>b small{font-size:10px;font-weight:500}
</style>