<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import { haptic } from '@/lib/telegram'

const emit = defineEmits<{ openSelector: [] }>()
const route = useRoute()
const labels: Record<string, string> = { home: 'Life OS', smoking: 'Курение', fitness: 'Тренировки', finance: 'Бюджет', work: 'Фокус', settings: 'Настройки' }
const title = computed(() => labels[String(route.name)] ?? 'Life OS')
const open = () => { haptic('light'); emit('openSelector') }
</script>

<template>
  <header class="tg-header">
    <button class="tg-pill" type="button" aria-label="Переключить модуль" @click="open">
      <span>{{ title }}</span><ChevronDown :size="13" :stroke-width="2.5" />
    </button>
  </header>
</template>

<style scoped>
.tg-header {
  position: fixed; z-index: 50; inset: 0 0 auto; height: calc(44px + var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top, 0px)));
  padding: var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top, 0px)) 60px 0; display: flex; align-items: center; justify-content: center;
  pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,.78), rgba(0,0,0,0));
}
.tg-pill {
  pointer-events: auto; height: 32px; max-width: 180px; padding: 0 13px 0 15px; border: 0; border-radius: 16px;
  display: inline-flex; align-items: center; justify-content: center; gap: 4px; color: var(--ink); background: rgba(255,255,255,.72);
  box-shadow: inset 0 0 0 .5px rgba(255,255,255,.15), 0 2px 8px rgba(0,0,0,.12); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  font: 600 14px/1 -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; transition: transform .12s ease, background .2s ease;
}
.tg-pill:active { transform: scale(.96); background: rgba(255,255,255,.18); }
.tg-pill span { display: block; max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
@media (prefers-color-scheme: light) { .tg-header { background: linear-gradient(180deg, rgba(239,239,244,.9), rgba(239,239,244,0)); } .tg-pill { background: rgba(255,255,255,.72); box-shadow: inset 0 0 0 .5px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.08); } }
@media (prefers-color-scheme: dark) { .tg-pill { color:#f9fafb; background:rgba(28,28,33,.84); } }
</style>
