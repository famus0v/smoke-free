<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { WalletCards, Plus, Utensils, Dumbbell, Home, Sparkles, ChevronRight } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { useAppStore } from '@/stores/app'
import { impact, notify } from '@/telegram'
import type { ExpenseCategory } from '@/types'

const store=useAppStore(),router=useRouter(),sheet=ref(false),amount=ref<number|null>(null),note=ref(''),category=ref<ExpenseCategory>('food')
const categories=[{id:'food' as const,label:'Еда',icon:Utensils},{id:'sport' as const,label:'Спорт',icon:Dumbbell},{id:'fixed' as const,label:'Обязательное',icon:Home},{id:'fun' as const,label:'Радость',icon:Sparkles}]
const money=(value:number)=>Math.floor(value).toLocaleString('ru-RU')
const spentToday=computed(()=>{const today=new Date().toISOString().slice(0,10);return store.state.finance.expenses.filter(item=>item.date.startsWith(today)).reduce((sum,item)=>sum+item.amount,0)})
const add=()=>{if(!amount.value||amount.value<=0){notify('error');return}store.addExpense(amount.value,category.value,note.value||undefined);amount.value=null;note.value='';sheet.value=false;notify('success')}
</script>
<template>
  <section class="life-page">
    <AppHeader title="Бюджет" @settings="router.push('/settings')"/>
    <section class="module-hero finance-main-hero"><span class="hero-icon"><WalletCards :size="25"/></span><p>МОЖНО ПОТРАТИТЬ СЕГОДНЯ</p><b>{{ money(store.safeToSpend) }} {{ store.state.finance.currency }}</b><small>Потрачено сегодня: {{ money(spentToday) }} {{ store.state.finance.currency }}</small></section>
    <button class="primary module-primary" @click="sheet=true;impact('medium')"><Plus :size="20"/> Записать расход</button>
    <p class="section-heading">ПОСЛЕДНИЕ РАСХОДЫ</p>
    <div class="group-list"><div v-if="!store.state.finance.expenses.length" class="empty-row">Расходов пока нет</div><div v-for="item in store.state.finance.expenses.slice(0,6)" :key="item.id" class="simple-row"><span><b>{{ categories.find(cat=>cat.id===item.category)?.label }}</b><small>{{ item.note || new Date(item.date).toLocaleDateString('ru-RU') }}</small></span><b>−{{ money(item.amount) }} {{ store.state.finance.currency }}</b></div></div>
    <p class="section-heading">ВИШЛИСТ</p>
    <div class="group-list"><div v-for="item in store.state.finance.wishlist" :key="item.id" class="simple-row"><span><b>{{ item.title }}</b><small :class="{available:item.unlocked}">{{ item.unlocked?'Доступно':'Копим' }}</small></span><b>{{ money(item.cost) }} {{ store.state.finance.currency }}</b><ChevronRight :size="17"/></div></div>
  </section>
  <Transition name="sheet-slide"><div v-if="sheet" class="sheet-backdrop" @click.self="sheet=false"><section class="sheet expense-sheet"><div class="sheet-handle"/><div class="sheet-title"><h2>Новый расход</h2><button @click="sheet=false">×</button></div><label>Сумма</label><div class="money-input"><input v-model.number="amount" class="text-input" type="number" placeholder="0"/><b>{{ store.state.finance.currency }}</b></div><label>Категория</label><div class="sheet-options"><button v-for="item in categories" :key="item.id" :class="{active:category===item.id}" @click="category=item.id;impact()"><component :is="item.icon" :size="18"/>{{ item.label }}</button></div><label>Комментарий</label><input v-model="note" class="text-input" placeholder="Необязательно"/><button class="primary" @click="add">Сохранить расход</button></section></div></Transition>
</template>
