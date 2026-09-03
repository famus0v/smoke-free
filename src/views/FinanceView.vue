<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Utensils, Dumbbell, Home, Sparkles, WalletCards, ReceiptText, Landmark, Repeat2, BellRing, Trash2 } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'
import type { ExpenseCategory } from '@/types'

type FinanceSection = 'today' | 'history' | 'debts' | 'subscriptions'
const store = useAppStore()
const section = ref<FinanceSection>('today')
const amount = ref<number | null>(null)
const note = ref('')
const category = ref<ExpenseCategory>('food')
const debtTitle = ref('')
const debtAmount = ref<number | null>(null)
const debtDueDate = ref('')
const subscriptionTitle = ref('')
const subscriptionAmount = ref<number | null>(null)
const subscriptionDay = ref<number | null>(1)
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
const nextDays = computed(() => [1, 2, 3].map((offset) => { const date = new Date(); date.setDate(date.getDate() + offset); return { label: offset === 1 ? 'Завтра' : date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), limit: store.futureDailyLimit } }))
const activeSubscriptions = computed(() => store.state.finance.subscriptions.filter((subscription) => subscription.active))
const monthlyBurn = computed(() => activeSubscriptions.value.reduce((sum, subscription) => sum + subscription.amount, 0))
const dailyBurn = computed(() => monthlyBurn.value / 30)
const daysUntilBilling = (billingDay: number) => {
  const now = new Date()
  const today = now.getDate()
  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const day = Math.min(billingDay, currentMonthDays)
  if (day >= today) return day - today
  return currentMonthDays - today + Math.min(billingDay, new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate())
}
const upcomingSubscriptions = computed(() => activeSubscriptions.value.filter((subscription) => daysUntilBilling(subscription.billingDay) <= 2).sort((a, b) => daysUntilBilling(a.billingDay) - daysUntilBilling(b.billingDay)))
const billingText = (day: number) => { const days = daysUntilBilling(day); return days === 0 ? 'спишется сегодня' : days === 1 ? 'спишется завтра' : `спишется через ${days} дня` }
const setSection = (value: FinanceSection) => { section.value = value; haptic('light') }
const addExpense = () => { if (!amount.value || amount.value <= 0) { notify('error'); return }; store.addExpense(amount.value, category.value, note.value || undefined); amount.value = null; note.value = ''; notify('success') }
const addDebt = () => { if (!store.addDebt(debtTitle.value, Number(debtAmount.value), debtDueDate.value || undefined)) { notify('error'); return }; debtTitle.value = ''; debtAmount.value = null; debtDueDate.value = ''; notify('success') }
const addSubscription = () => { if (!store.addSubscription(subscriptionTitle.value, Number(subscriptionAmount.value), Number(subscriptionDay.value))) { notify('error'); return }; subscriptionTitle.value = ''; subscriptionAmount.value = null; subscriptionDay.value = 1; notify('success') }
</script>

<template>
  <section class="screen finance-screen">
    <p class="eyebrow">Ваш бюджет</p>
    <h1 class="screen-title">{{ titles[section] }}</h1>
    <div class="module-tabs finance-tabs"><button :class="{ active: section === 'today' }" @click="setSection('today')">Сегодня</button><button :class="{ active: section === 'history' }" @click="setSection('history')">История</button><button :class="{ active: section === 'debts' }" @click="setSection('debts')">Долги</button><button :class="{ active: section === 'subscriptions' }" @click="setSection('subscriptions')">Подписки</button></div>

    <div v-if="section === 'today'" class="module-content">
      <section class="finance-hero budget-hero"><span class="finance-hero-icon"><WalletCards :size="25" /></span><p>ТРАТЫ СЕГОДНЯ</p><b>{{ money(spentToday) }} <small>/ {{ money(store.todayLimit) }} {{ store.state.finance.currency }}</small></b><span>лимит сегодня</span></section>
      <section class="card future-limits"><div class="future-title"><span>Лимит на следующие дни</span><b>{{ money(store.futureDailyLimit) }} {{ store.state.finance.currency }} / день</b></div><div class="future-days"><div v-for="day in nextDays" :key="day.label"><small>{{ day.label }}</small><b>{{ money(day.limit) }} {{ store.state.finance.currency }}</b></div></div></section>
      <h2 class="section-title">Быстрый расход</h2>
      <div class="card expense-form"><label class="amount-field"><input v-model.number="amount" class="app-input amount-input" type="number" inputmode="decimal" placeholder="0" aria-label="Сумма" /><span>{{ store.state.finance.currency }}</span></label><input v-model="note" class="app-input note" placeholder="Комментарий (необязательно)" /><div class="category-grid"><button v-for="item in categories" :key="item.id" :class="{ active: category === item.id }" @click="category = item.id; haptic('light')"><span :style="{ background: item.color }"><component :is="item.icon" :size="17" /></span><small>{{ item.label }}</small></button></div><button class="primary-btn add" @click="addExpense"><Plus :size="18" /> Записать расход</button></div>
    </div>

    <div v-else-if="section === 'history'" class="module-content"><div class="card"><div v-if="!store.state.finance.expenses.length" class="empty"><ReceiptText :size="28" /><span>Расходов пока нет</span></div><div v-for="expense in store.state.finance.expenses" :key="expense.id" class="row transaction"><span><b>{{ categories.find((item) => item.id === expense.category)?.label }}</b><small>{{ new Date(expense.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }}<template v-if="expense.note"> · {{ expense.note }}</template></small></span><b>−{{ money(expense.amount) }} {{ store.state.finance.currency }}</b></div></div></div>

    <div v-else-if="section === 'debts'" class="module-content"><section class="debt-hero"><Landmark :size="23" /><div><span>К возврату</span><b>{{ money(store.state.finance.debts.reduce((sum, debt) => sum + debt.amount, 0)) }} {{ store.state.finance.currency }}</b></div></section><div class="card compact-form"><input v-model="debtTitle" class="app-input" placeholder="Кому или за что" /><label class="amount-field"><input v-model.number="debtAmount" class="app-input" type="number" inputmode="decimal" placeholder="Сумма" /><span>{{ store.state.finance.currency }}</span></label><input v-model="debtDueDate" class="app-input" type="date" /><button class="primary-btn add" @click="addDebt"><Plus :size="18" /> Добавить долг</button></div><h2 class="section-title">Активные долги</h2><div class="card"><div v-if="!store.state.finance.debts.length" class="empty"><Landmark :size="28" /><span>Долгов нет</span></div><div v-for="debt in store.state.finance.debts" :key="debt.id" class="row debt-row"><span><b>{{ debt.title }}</b><small>{{ debt.dueDate ? `Вернуть до ${new Date(debt.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}` : 'Срок не указан' }}</small></span><b>{{ money(debt.amount) }} {{ store.state.finance.currency }}</b><button aria-label="Удалить долг" @click="store.removeDebt(debt.id); haptic('light')"><Trash2 :size="17" /></button></div></div></div>

    <div v-else class="module-content"><section class="burn-hero"><Repeat2 :size="23" /><div><span>Фиксированная стоимость жизни</span><b>{{ money(dailyBurn) }} {{ store.state.finance.currency }} <small>/ день</small></b><small>{{ money(monthlyBurn) }} {{ store.state.finance.currency }} / месяц</small></div></section><section v-if="upcomingSubscriptions.length" class="reminder"><BellRing :size="19" /><p><b>{{ upcomingSubscriptions[0].title }}</b> {{ billingText(upcomingSubscriptions[0].billingDay) }}. Ты ещё пользуешься сервисом?</p></section><div class="card compact-form subscription-form"><input v-model="subscriptionTitle" class="app-input" placeholder="Новая подписка" /><label class="amount-field"><input v-model.number="subscriptionAmount" class="app-input" type="number" inputmode="decimal" placeholder="Сумма в месяц" /><span>{{ store.state.finance.currency }}</span></label><label class="billing-day"><span>День списания</span><input v-model.number="subscriptionDay" class="app-input" type="number" min="1" max="31" inputmode="numeric" /></label><button class="primary-btn add" @click="addSubscription"><Plus :size="18" /> Добавить подписку</button></div><h2 class="section-title">Все сервисы</h2><div class="card subscription-list"><div v-for="subscription in store.state.finance.subscriptions" :key="subscription.id" class="row subscription-row"><button class="subscription-toggle" :class="{ active: subscription.active }" :aria-label="subscription.active ? 'Отключить подписку' : 'Включить подписку'" @click="subscription.active = !subscription.active; haptic('light')" /><span><b>{{ subscription.title }}</b><small>{{ billingText(subscription.billingDay) }}</small></span><b>{{ money(subscription.amount) }} {{ store.state.finance.currency }}</b><button aria-label="Удалить подписку" @click="store.removeSubscription(subscription.id); haptic('light')"><Trash2 :size="17" /></button></div></div></div>
  </section>
</template>

<style scoped>
.finance-screen{padding-bottom:calc(118px + env(safe-area-inset-bottom,0px))}.finance-tabs{margin-top:12px}.module-content{margin-top:13px}.budget-hero,.burn-hero{padding:18px;background:linear-gradient(135deg,#087fdc,#5ab1f4);box-shadow:0 4px 10px rgba(0,122,255,.16)}.budget-hero>p{margin:14px 0 4px;color:rgba(255,255,255,.76);font-size:11px;font-weight:750;letter-spacing:.75px}.budget-hero>b{display:block;color:#fff;font-size:32px;letter-spacing:-1px}.budget-hero>b small{font-size:17px;font-weight:650;opacity:.84}.budget-hero>span:last-child{display:block;margin-top:5px;color:rgba(255,255,255,.82);font-size:13px}.future-limits{margin-top:12px;padding:14px}.future-title{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.future-title span,.future-days small{color:var(--secondary);font-size:13px}.future-title b{font-size:13px}.future-days{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:13px}.future-days>div{padding:10px 7px;border-radius:10px;background:var(--pressed);text-align:center}.future-days small,.future-days b{display:block}.future-days small{font-size:11px}.future-days b{margin-top:3px;font-size:12px}.expense-form,.compact-form{padding:14px}.amount-field{display:flex;align-items:center;gap:8px}.amount-input{min-width:0;flex:1;font-size:28px;font-weight:750}.amount-field>input{min-width:0;flex:1}.amount-field span{color:var(--secondary);font-size:15px;white-space:nowrap}.note{width:100%;margin-top:8px}.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:13px 0}.category-grid button{padding:7px 1px;border:1px solid transparent;border-radius:10px;color:var(--secondary);background:transparent;display:grid;place-items:center;gap:4px}.category-grid button.active{border-color:var(--accent);color:var(--text);background:rgba(10,132,255,.08)}.category-grid button span{width:29px;height:29px;border-radius:8px;color:white;display:grid;place-items:center}.category-grid small{font-size:10px}.add{width:100%;display:flex;align-items:center;justify-content:center;gap:5px}.empty{min-height:105px;display:grid;place-items:center;align-content:center;gap:8px;color:var(--secondary);font-size:13px}.transaction span,.debt-row span,.subscription-row>span{display:grid;gap:3px;flex:1}.transaction small,.debt-row small,.subscription-row small{color:var(--secondary);font-size:12px}.transaction> b,.debt-row> b,.subscription-row> b{font-size:13px;white-space:nowrap}.debt-hero,.burn-hero{display:flex;align-items:flex-start;gap:12px;border-radius:16px;color:#fff}.debt-hero{padding:16px;background:linear-gradient(135deg,#f18b0b,#ffb340);box-shadow:0 4px 10px rgba(255,149,0,.16)}.debt-hero span,.burn-hero span{display:block;color:rgba(255,255,255,.8);font-size:12px}.debt-hero b,.burn-hero b{display:block;margin-top:3px;font-size:25px}.compact-form{display:grid;gap:8px;margin-top:12px}.billing-day{display:flex;align-items:center;gap:10px;color:var(--secondary);font-size:14px}.billing-day input{width:70px;margin-left:auto;text-align:center}.debt-row button,.subscription-row>button:last-child{display:grid;place-items:center;width:30px;height:30px;color:var(--tertiary);background:transparent}.burn-hero{background:linear-gradient(135deg,#7c3aed,#b76af2);box-shadow:0 4px 10px rgba(168,85,247,.16)}.burn-hero>div{display:grid;gap:2px}.burn-hero b{font-size:23px}.burn-hero b small,.burn-hero>div>small{color:rgba(255,255,255,.82);font-size:13px;font-weight:600}.reminder{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:13px;border-radius:14px;color:#865900;background:rgba(255,159,10,.16)}.reminder p{margin:0;font-size:13px;line-height:1.35}.subscription-form{margin-top:12px}.subscription-row{gap:9px}.subscription-toggle{width:22px;height:22px;flex:none;border:2px solid var(--tertiary);border-radius:7px;background:transparent}.subscription-toggle.active{border-color:var(--purple);background:var(--purple);box-shadow:inset 0 0 0 5px var(--card)}
</style>