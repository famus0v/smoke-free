<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, Wind, CigaretteOff, Trophy, Flame, Share2, BadgeDollarSign, TrendingUp, CalendarDays, ReceiptText, Zap } from 'lucide-vue-next'
import TimeCounter from '@/components/TimeCounter.vue'
import MetricCard from '@/components/MetricCard.vue'
import SosBreathingModal from '@/components/SosBreathingModal.vue'
import CravingSheet from '@/components/CravingSheet.vue'
import HealthMilestoneItem from '@/components/HealthMilestoneItem.vue'
import CravingHeatmap from '@/components/CravingHeatmap.vue'
import ShareCardSheet from '@/components/ShareCardSheet.vue'
import { useTrackerStore } from '@/stores/tracker'
import { impact, notify } from '@/telegram'
import type { CravingContext } from '@/types'

const store = useTrackerStore()
const section = ref<'home'|'health'|'finance'|'history'>('home')
const sosOpen=ref(false), cravingOpen=ref(false), slipOpen=ref(false), shareOpen=ref(false)
const slipCount=ref(1), slipReason=ref('')
const currency=computed(()=>store.profile?.currency ?? '₽')
const formatMoney=(value:number)=>`${Math.floor(value).toLocaleString('ru-RU')} ${currency.value}`
const dailySaving=computed(()=>store.profile ? store.profile.monthlySpend/30 : 0)
const saveCraving=(context:CravingContext,intensity:1|2|3|4|5,note:string)=>{store.logCraving(context,intensity,note);cravingOpen.value=false;notify('success')}
const logSlip=()=>{if(!slipReason.value.trim())return;store.logSlip(Math.max(1,slipCount.value),slipReason.value);slipReason.value='';slipOpen.value=false;notify('warning')}
const milestones=[
  {time:20/60,title:'20 минут',description:'Пульс начинает возвращаться к обычному уровню.'},
  {time:8,title:'8 часов',description:'Уровень угарного газа снижается, кислород восстанавливается.'},
  {time:24,title:'24 часа',description:'Никотин в крови снижается до нуля.'},
  {time:48,title:'48 часов',description:'Вкус и обоняние могут стать ярче.'},
  {time:72,title:'72 часа',description:'Бронхи начинают расслабляться — дышать легче.'},
  {time:24*14,title:'2 недели',description:'Кровообращение улучшается, нагрузка переносится увереннее.'},
  {time:24*90,title:'3 месяца',description:'Функция лёгких и выносливость продолжают улучшаться.'},
  {time:24*365,title:'1 год',description:'Риск для сердца существенно снижается.'},
]
const progress=(hours:number)=>Math.min(100,Math.floor(store.elapsedMs/3600000/hours*100))
const events=computed(()=>[
  ...store.data.cravings.map(item=>({id:item.id,type:'craving',time:item.timestamp,title:`Тяга ${item.intensity}/5`,note:item.note})),
  ...store.data.slips.map(item=>({id:item.id,type:'slip',time:item.timestamp,title:`Эпизод · ${item.count}`,note:item.reason}))
].sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime()))
</script>

<template>
  <section class="life-page smoke-module">
    <p class="eyebrow">БЕЗ ДЫМА</p>
    <h1 class="screen-title">{{ section==='home'?'Сегодня без дыма':section==='health'?'Здоровье':section==='finance'?'Финансы':'История' }}</h1>
    <div class="module-tabs"><button :class="{active:section==='home'}" @click="section='home';impact()">Сегодня</button><button :class="{active:section==='health'}" @click="section='health';impact()">Здоровье</button><button :class="{active:section==='finance'}" @click="section='finance';impact()">Деньги</button><button :class="{active:section==='history'}" @click="section='history';impact()">История</button></div>

    <div v-if="section==='home'" class="module-content home-page">
      <section class="home-hero"><span class="home-hero-icon"><CigaretteOff :size="25"/></span><TimeCounter :elapsed="store.elapsedMs"/></section>
      <div class="metrics home-grid"><MetricCard :value="formatMoney(store.moneySaved)" label="сэкономлено" tone="green" :icon="BadgeDollarSign"/><MetricCard :value="Math.floor(store.cigarettesNotSmoked).toLocaleString('ru-RU')" label="не выкурено" tone="blue" :icon="CigaretteOff"/><MetricCard :value="`${store.smokeFreeRatio}%`" label="чистых дней" tone="purple" :icon="Trophy"/></div>
      <button class="sos-button" @click="sosOpen=true;impact('medium')"><span><b>Тянет курить?</b><small>Побудь с собой 3 минуты</small></span><Wind :size="29"/></button>
      <div class="action-row"><button class="quick-action" @click="cravingOpen=true;impact()"><Flame :size="19"/>Записать тягу</button><button class="quick-action muted-action" @click="slipOpen=true;impact()"><AlertTriangle :size="18"/>Я оступился</button></div>
      <button class="share-card-button" @click="shareOpen=true;impact('medium')"><Share2 :size="19"/><span><b>Поделиться достижением</b><small>Создать карточку для сторис</small></span></button>
    </div>
    <div v-else-if="section==='health'" class="module-content"><p class="page-intro">Тело восстанавливается поэтапно. Результаты индивидуальны.</p><div class="group-list"><HealthMilestoneItem v-for="item in milestones" :key="item.title" :title="item.title" :description="item.description" :progress="progress(item.time)" :complete="progress(item.time)>=100"/></div></div>
    <div v-else-if="section==='finance'" class="module-content finance-page"><section class="finance-hero"><span class="finance-hero-icon"><BadgeDollarSign :size="25"/></span><p>УЖЕ СОХРАНЕНО</p><b>{{ formatMoney(store.moneySaved) }}</b><small>Деньги остаются у тебя — день за днём.</small></section><div class="finance-grid"><article><TrendingUp :size="20"/><span>В день</span><b>{{ formatMoney(dailySaving) }}</b></article><article><CalendarDays :size="20"/><span>За 30 дней</span><b>{{ formatMoney(dailySaving*30) }}</b></article><article><ReceiptText :size="20"/><span>Не выкурено</span><b>{{ Math.floor(store.cigarettesNotSmoked) }}</b></article></div></div>
    <div v-else class="module-content history-page"><div class="history-intro"><p>Дневник помогает замечать ситуации, в которых нужна поддержка.</p><div class="history-summary"><span><b>{{ store.data.cravings.length }}</b> тяг</span><span><b>{{ store.data.slips.length }}</b> эпизодов</span></div></div><CravingHeatmap v-if="store.data.cravings.length" :logs="store.data.cravings"/><div v-if="events.length" class="group-list history-list"><article v-for="event in events" :key="`${event.type}-${event.id}`" class="history-row"><div class="history-icon"><Zap v-if="event.type==='craving'"/><AlertTriangle v-else/></div><div class="history-copy"><div class="history-line"><b>{{ event.title }}</b><time>{{ new Date(event.time).toLocaleDateString('ru-RU',{day:'numeric',month:'short'}) }}</time></div><p>{{ new Date(event.time).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}) }}</p><small v-if="event.note">{{ event.note }}</small></div></article></div><div v-else class="empty-state"><Wind :size="32"/><p>Записей пока нет.</p></div></div>
  </section>
  <SosBreathingModal v-if="sosOpen" @close="completed=>{sosOpen=false;if(completed)notify('success')}"/><Transition name="sheet-slide"><CravingSheet v-if="cravingOpen" @close="cravingOpen=false" @save="saveCraving"/></Transition><Transition name="sheet-slide"><ShareCardSheet v-if="shareOpen" :days="store.elapsedDays" :saved="store.moneySaved" :currency="currency" @close="shareOpen=false"/></Transition>
  <Transition name="sheet-slide"><div v-if="slipOpen" class="sheet-backdrop" @click.self="slipOpen=false"><section class="sheet slip-sheet"><div class="sheet-handle"/><div class="sheet-title"><h2>Ты не начал с нуля</h2><button @click="slipOpen=false">×</button></div><p class="muted">Один эпизод не отменяет твой путь.</p><label>Сколько сигарет?</label><input v-model.number="slipCount" class="text-input" type="number" min="1"/><label>Что спровоцировало?</label><input v-model="slipReason" class="text-input" placeholder="Например, стресс или компания"/><button class="primary" @click="logSlip">Записать бережно</button></section></div></Transition>
</template>
