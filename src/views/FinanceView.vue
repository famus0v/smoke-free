<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Utensils, Dumbbell, Home, Sparkles, LockOpen, ChevronRight } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'
import type { ExpenseCategory } from '@/types'

const store=useAppStore(); const amount=ref<number|null>(null); const note=ref(''); const category=ref<ExpenseCategory>('food')
const categories=[{id:'food' as const,label:'Еда',icon:Utensils,color:'#ff9f0a'},{id:'sport' as const,label:'Спорт',icon:Dumbbell,color:'#30d158'},{id:'fixed' as const,label:'Обяз.',icon:Home,color:'#0a84ff'},{id:'fun' as const,label:'Радость',icon:Sparkles,color:'#bf5af2'}]
const money=(n:number)=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)
const spentToday=computed(()=>{const key=new Date().toISOString().slice(0,10);return store.state.finance.expenses.filter(e=>e.date.startsWith(key)).reduce((s,e)=>s+e.amount,0)})
const add=()=>{if(!amount.value||amount.value<=0){notify('error');return}store.addExpense(amount.value,category.value,note.value||undefined);amount.value=null;note.value='';notify('success')}
</script>

<template>
  <section class="screen">
    <p class="eyebrow">Ваш бюджет</p><h1 class="screen-title">Можно потратить</h1><p class="screen-subtitle">Лимит автоматически распределён до конца месяца.</p>
    <div class="budget-hero card"><span>Safe-to-Spend сегодня</span><strong>{{ money(store.safeToSpend) }} <small>{{ store.state.finance.currency }}</small></strong><div class="budget-meta"><span>Потрачено сегодня</span><b>{{ money(spentToday) }} {{ store.state.finance.currency }}</b></div></div>
    <h2 class="section-title">Быстрый расход</h2>
    <div class="card expense-form">
      <div class="amount-field"><input v-model.number="amount" type="number" inputmode="decimal" placeholder="0" aria-label="Сумма" /><span>{{ store.state.finance.currency }}</span></div>
      <input v-model="note" class="note" placeholder="Комментарий (необязательно)" />
      <div class="category-grid"><button v-for="item in categories" :key="item.id" :class="{active:category===item.id}" @click="category=item.id;haptic('light')"><span :style="{background:item.color}"><component :is="item.icon" :size="17" /></span><small>{{ item.label }}</small></button></div>
      <button class="primary-btn add" @click="add"><Plus :size="18" /> Записать расход</button>
    </div>
    <h2 class="section-title">Вишлист</h2>
    <div class="card wishlist"><div v-for="item in store.state.finance.wishlist" :key="item.id" class="row"><span class="wish-icon" :class="{unlocked:item.unlocked}"><LockOpen :size="18" /></span><span class="wish-copy"><b>{{ item.title }}</b><small>{{ money(item.cost) }} {{ store.state.finance.currency }}</small></span><ChevronRight :size="17" class="muted" /></div></div>
    <h2 class="section-title">Недавние расходы</h2>
    <div class="card"><div v-if="!store.state.finance.expenses.length" class="empty">Расходов пока нет</div><div v-for="expense in store.state.finance.expenses.slice(0,5)" :key="expense.id" class="row transaction"><span>{{ categories.find(c=>c.id===expense.category)?.label }}</span><b>−{{ money(expense.amount) }} {{ store.state.finance.currency }}</b></div></div>
  </section>
</template>

<style scoped>
.budget-hero{padding:21px 17px;background:radial-gradient(circle at 88% 5%,rgba(10,132,255,.28),transparent 40%),var(--card)}.budget-hero>span{color:var(--secondary);font-size:13px}.budget-hero>strong{display:block;margin:5px 0 22px;font-size:36px;letter-spacing:-.03em}.budget-hero strong small{font-size:20px}.budget-meta{padding-top:13px;border-top:.5px solid var(--separator);display:flex;justify-content:space-between;font-size:13px}.budget-meta span{color:var(--secondary)}.expense-form{padding:14px}.amount-field{height:60px;border-radius:12px;background:var(--pressed);display:flex;align-items:center;padding:0 16px}.amount-field input{min-width:0;flex:1;border:0;outline:0;color:var(--text);background:transparent;font-size:30px;font-weight:750}.amount-field span{color:var(--secondary);font-size:21px}.note{width:100%;height:43px;margin-top:8px;padding:0 12px;border:0;outline:0;border-radius:10px;color:var(--text);background:var(--pressed)}.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:13px 0}.category-grid button{padding:7px 1px;border:1px solid transparent;border-radius:10px;color:var(--secondary);background:transparent;display:grid;place-items:center;gap:4px}.category-grid button.active{border-color:var(--accent);color:var(--text);background:rgba(10,132,255,.08)}.category-grid button span{width:29px;height:29px;border-radius:8px;color:white;display:grid;place-items:center}.category-grid small{font-size:10px}.add{width:100%;display:flex;align-items:center;justify-content:center;gap:5px}.wish-icon{width:34px;height:34px;border-radius:9px;color:var(--secondary);background:var(--pressed);display:grid;place-items:center}.wish-icon.unlocked{color:var(--green);background:rgba(48,209,88,.12)}.wish-copy{display:grid;gap:2px;flex:1}.wish-copy small{color:var(--secondary)}.empty{padding:22px;text-align:center;color:var(--secondary);font-size:13px}.transaction span{flex:1;color:var(--secondary)}
</style>
