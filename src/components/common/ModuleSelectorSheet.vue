<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { LayoutGrid, CigaretteOff, Dumbbell, WalletCards, Focus, Settings, Check } from 'lucide-vue-next'
import { haptic } from '@/lib/telegram'
import { useAppStore } from '@/stores/app'
import type { ModuleId } from '@/types'

const open = defineModel<boolean>({ required: true })
const router = useRouter()
const route = useRoute()
const store = useAppStore()
const modules = [
  { id: 'hub' as ModuleId, title: 'Life OS', hint: 'Обзор дня', path: '/', icon: LayoutGrid, color: '#8e8e93' },
  { id: 'smoking' as ModuleId, title: 'Курение', hint: 'Оставайтесь свободным', path: '/smoking', icon: CigaretteOff, color: '#30d158' },
  { id: 'fitness' as ModuleId, title: 'Тренировки', hint: 'Подходы и отдых', path: '/fitness', icon: Dumbbell, color: '#ff9f0a' },
  { id: 'finance' as ModuleId, title: 'Бюджет', hint: 'Safe-to-Spend', path: '/finance', icon: WalletCards, color: '#0a84ff' },
  { id: 'work' as ModuleId, title: 'Фокус', hint: 'Три главных дела', path: '/work', icon: Focus, color: '#bf5af2' },
]
const select = async (item: typeof modules[number]) => { haptic('light'); store.setActiveModule(item.id); open.value = false; await router.push(item.path) }
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-layer" @click.self="open = false">
        <section class="sheet-card" role="dialog" aria-modal="true" aria-label="Выбор модуля">
          <div class="grabber" /><h2>Перейти в модуль</h2>
          <div class="module-list">
            <button v-for="item in modules" :key="item.id" class="module-row" @click="select(item)">
              <span class="module-icon" :style="{ background: item.color }"><component :is="item.icon" :size="20" /></span>
              <span class="module-copy"><b>{{ item.title }}</b><small>{{ item.hint }}</small></span>
              <Check v-if="route.path === item.path" :size="20" class="check" />
            </button>
            <button class="module-row" @click="open = false; router.push('/settings')">
              <span class="module-icon neutral"><Settings :size="20" /></span><span class="module-copy"><b>Настройки</b><small>Данные и резервная копия</small></span>
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-layer { position: fixed; z-index: 100; inset: 0; display: flex; align-items: flex-end; background: rgba(0,0,0,.5); backdrop-filter: blur(3px); }
.sheet-card { width: 100%; padding: 8px 16px calc(18px + env(safe-area-inset-bottom, 0px)); border-radius: 24px 24px 0 0; background: var(--sheet); box-shadow: 0 -10px 40px rgba(0,0,0,.28); }
.grabber { width: 36px; height: 5px; margin: 0 auto 14px; border-radius: 3px; background: var(--separator); }
h2 { margin: 0 4px 14px; font-size: 20px; }
.module-list { overflow: hidden; border-radius: 14px; background: var(--card); }
.module-row { width: 100%; min-height: 58px; padding: 8px 12px; border: 0; color: var(--text); background: transparent; display: flex; align-items: center; gap: 12px; text-align: left; }
.module-row + .module-row { border-top: .5px solid var(--separator); }
.module-row:active { background: var(--pressed); }
.module-icon { width: 34px; height: 34px; border-radius: 9px; color: white; display: grid; place-items: center; }.module-icon.neutral { background: #8e8e93; }
.module-copy { flex: 1; min-width: 0; display: grid; gap: 2px; }.module-copy b { font-size: 16px; }.module-copy small { color: var(--secondary); font-size: 12px; }.check { color: var(--accent); }
.sheet-enter-active,.sheet-leave-active { transition: opacity .25s ease; }.sheet-enter-active .sheet-card,.sheet-leave-active .sheet-card { transition: transform .3s cubic-bezier(.2,.8,.2,1); }.sheet-enter-from,.sheet-leave-to { opacity: 0; }.sheet-enter-from .sheet-card,.sheet-leave-to .sheet-card { transform: translateY(100%); }
</style>
