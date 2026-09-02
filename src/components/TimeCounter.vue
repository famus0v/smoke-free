<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ elapsed: number }>()
const parts = computed(() => { let n = Math.floor(props.elapsed / 1000); const days = Math.floor(n / 86400); n %= 86400; const hours = Math.floor(n / 3600); n %= 3600; return [days, hours, Math.floor(n / 60), n % 60] })
</script>
<template><section class="counter-card"><p class="section-label">ТЫ УЖЕ НЕ КУРИШЬ</p><div class="counter"><div v-for="(part, i) in parts" :key="i"><b>{{ String(part).padStart(2, '0') }}</b><span>{{ ['дней', 'часов', 'минут', 'секунд'][i] }}</span></div></div></section></template>
