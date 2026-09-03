<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CigaretteOff, Dumbbell, WalletCards, Focus, ChevronRight } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { impact } from '@/telegram'

const router = useRouter()
const modules = [
  { path:'/smoking', title:'Без дыма', text:'Таймер, SOS, здоровье и дневник', icon:CigaretteOff, tone:'green' },
  { path:'/fitness', title:'Тренировки', text:'Подходы, веса и таймер отдыха', icon:Dumbbell, tone:'orange' },
  { path:'/finance', title:'Бюджет', text:'Safe-to-Spend, расходы и желания', icon:WalletCards, tone:'blue' },
  { path:'/work', title:'Фокус', text:'Три задачи, таймер и блокнот', icon:Focus, tone:'purple' },
]
const open = (path:string) => { impact('light'); router.push(path) }
</script>

<template>
  <section class="life-page">
    <AppHeader title="Модули" @settings="open('/settings')" />
    <p class="page-intro">Выбери область, которой хочешь уделить внимание сейчас.</p>
    <div class="module-list-grid">
      <button v-for="item in modules" :key="item.path" class="module-list-card" @click="open(item.path)">
        <span class="module-list-icon" :class="item.tone"><component :is="item.icon" :size="24"/></span>
        <span class="module-list-copy"><b>{{ item.title }}</b><small>{{ item.text }}</small></span>
        <ChevronRight :size="19"/>
      </button>
    </div>
  </section>
</template>
