<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Utensils, Dumbbell, Home, Sparkles, WalletCards } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'
import type { ExpenseCategory } from '@/types'

const store = useAppStore()
const amount = ref<number | null>(null)
const note = ref('')
const category = ref<ExpenseCategory>('food')
const categories = [
  { id: 'food' as const, label: 'Еда', icon: Utensils, color: '#ff9f0a' },
  { id: 'sport' as const, label: 'Спорт', icon: Dumbbell, color: '#30d158' },
  { id: 'fixed' as const, label: 'Обяз.', icon: Home, color: '#0a84ff' },
  { id: 'fun' as const, label: 'Радость', icon: Sparkles, color: '#bf5af2' },
]
const money = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
const todayKey = () => new Date().toISOString().slice(0, 10)
const spentToday = computed(() => store.state.finance.expenses.filter((expense) => expense.date.startsWith(todayKey())).reduce((sum, expense) => sum + expense.amount, 0))
const nextDays = computed(() => [1, 2, 3].map((offset) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return { label: offset === 1 ? 'Завтра' : date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), limit: store.futureDailyLimit }
}))
const add = () => {
  if (!amount.value || amount.value <= 0) { notify('error'); return }
  store.addExpense(amount.value, category.value, note.value || undefined)
  amount.value = null
  note.value = ''
  notify('success')
}
</script>

<template>
  <section class="screen finance-screen">
    <p class="eyebrow">Ваш бюджет</p>
    <h1 class="screen-title">Можно потратить</h1>
    <p class="screen-subtitle">Лимит на сегодня фиксирован, будущие дни пересчитываются.</p>

    <section class="finance-hero budget-hero">
      <span class="finance-hero-icon"><WalletCards :size="25" /></span>
      <p>ТРАТЫ СЕГОДНЯ</p>
      <b>{{ money(spentToday) }} <small>/ {{ money(store.todayLimit) }} {{ store.state.finance.currency }}</small></b>
      <span>сегодняшний лимит</span>
    </section>

    <section class="card future-limits">
      <div class="future-title"><span>Лимит на следующие дни</span><b>{{ money(store.futureDailyLimit) }} {{ store.state.finance.currency }} / день</b></div>
      <div class="future-days"><div v-for="day in nextDays" :key="day.label"><small>{{ day.label }}</small><b>{{ money(day.limit) }} {{ store.state.finance.currency }}</b></div></div>
    </section>

    <h2 class="section-title">Быстрый расход</h2>
    <div class="card expense-form">
      <label class="amount-field"><input v-model.number="amount" class="app-input amount-input" type="number" inputmode="decimal" placeholder="0" aria-label="Сумма" /><span>{{ store.state.finance.currency }}</span></label>
      <input v-model="note" class="app-input note" placeholder="Комментарий (необязательно)" />
      <div class="category-grid"><button v-for="item in categories" :key="item.id" :class="{ active: category === item.id }" @click="category = item.id; haptic('light')"><span :style="{ background: item.color }"><component :is="item.icon" :size="17" /></span><small>{{ item.label }}</small></button></div>
      <button class="primary-btn add" @click="add"><Plus :size="18" /> Записать расход</button>
    </div>

    <h2 class="section-title">Недавние расходы</h2>
    <div class="card"><div v-if="!store.state.finance.expenses.length" class="empty">Расходов пока нет</div><div v-for="expense in store.state.finance.expenses.slice(0, 5)" :key="expense.id" class="row transaction"><span>{{ categories.find((item) => item.id === expense.category)?.label }}<small v-if="expense.note">{{ expense.note }}</small></span><b>−{{ money(expense.amount) }} {{ store.state.finance.currency }}</b></div></div>
  </section>
</template>

<style scoped>
.finance-screen{padding-bottom:calc(118px + env(safe-area-inset-bottom,0px))}.budget-hero{padding:18px;background:linear-gradient(135deg,#087fdc,#5ab1f4);box-shadow:0 4px 10px rgba(0,122,255,.16)}.budget-hero>p{margin:14px 0 4px;color:rgba(255,255,255,.76);font-size:11px;font-weight:750;letter-spacing:.75px}.budget-hero>b{display:block;color:#fff;font-size:32px;letter-spacing:-1px}.budget-hero>b small{font-size:17px;font-weight:650;opacity:.84}.budget-hero>span:last-child{display:block;margin-top:5px;color:rgba(255,255,255,.82);font-size:13px}.future-limits{margin-top:12px;padding:14px}.future-title{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.future-title span{color:var(--secondary);font-size:13px}.future-title b{font-size:13px}.future-days{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:13px}.future-days>div{padding:10px 7px;border-radius:10px;background:var(--pressed);text-align:center}.future-days small,.future-days b{display:block}.future-days small{color:var(--secondary);font-size:11px}.future-days b{margin-top:3px;font-size:12px}.expense-form{padding:14px}.amount-field{display:flex;align-items:center;gap:8px}.amount-input{min-width:0;flex:1;font-size:28px;font-weight:750}.amount-field span{color:var(--secondary);font-size:19px}.note{width:100%;margin-top:8px}.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:13px 0}.category-grid button{padding:7px 1px;border:1px solid transparent;border-radius:10px;color:var(--secondary);background:transparent;display:grid;place-items:center;gap:4px}.category-grid button.active{border-color:var(--accent);color:var(--text);background:rgba(10,132,255,.08)}.category-grid button span{width:29px;height:29px;border-radius:8px;color:white;display:grid;place-items:center}.category-grid small{font-size:10px}.add{width:100%;display:flex;align-items:center;justify-content:center;gap:5px}.empty{padding:22px;text-align:center;color:var(--secondary);font-size:13px}.transaction span{display:grid;gap:2px;flex:1;color:var(--secondary)}.transaction small{font-size:11px;color:var(--tertiary)}
</style>
