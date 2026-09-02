<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CravingLog } from '../types'
const props = defineProps<{ logs: CravingLog[] }>()
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const selected = ref<{ day: number; hour: number; count: number; score: number } | null>(null)
const cells = computed(() => { const values = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ count: 0, score: 0 }))); for (const log of props.logs) { const date = new Date(log.timestamp); const cell = values[(date.getDay() + 6) % 7][date.getHours()]; cell.count++; cell.score += log.intensity }; return values })
const maxScore = computed(() => Math.max(1, ...cells.value.flat().map(cell => cell.score)))
const strongest = computed(() => { let result: { day: number; hour: number; count: number; score: number } | null = null; cells.value.forEach((row, day) => row.forEach((cell, hour) => { if (cell.score && (!result || cell.score > result.score)) result = { day, hour, ...cell } })); return result })
const select = (day: number, hour: number) => { const cell = cells.value[day][hour]; selected.value = cell.count ? { day, hour, ...cell } : null }
const text = (cell: { day: number; hour: number; count: number; score: number } | null) => cell ? `${days[cell.day]}, ${String(cell.hour).padStart(2, '0')}:00 — ${cell.count} ${cell.count === 1 ? 'тяга' : 'тяг'}, средняя сила ${Math.round(cell.score / cell.count)}/5` : 'Нажми на заполненную ячейку, чтобы увидеть детали.'
</script>
<template><section class="heatmap"><div class="heatmap-title"><div><h2>Карта уязвимости</h2><p>Дни недели × часы</p></div><span v-if="strongest" class="pattern">Пик: {{ text(strongest) }}</span></div><div class="heatmap-hours"><i></i><span v-for="hour in [0, 6, 12, 18]" :key="hour" :style="{ gridColumnStart: hour + 2 }">{{ hour }}</span></div><div class="heatmap-grid"><template v-for="(row, day) in cells" :key="day"><b>{{ days[day] }}</b><button v-for="(cell, hour) in row" :key="hour" type="button" class="heat-cell" :class="`level-${cell.score ? Math.ceil(cell.score / maxScore * 4) : 0}`" :aria-label="`${days[day]}, ${hour}:00: ${cell.count ? `${cell.count} тяг` : 'нет тяг'}`" @click="select(day, hour)"/></template></div><p class="heatmap-detail" aria-live="polite">{{ text(selected) }}</p></section></template>