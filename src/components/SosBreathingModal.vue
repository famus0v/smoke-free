<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { X, CheckCircle2 } from 'lucide-vue-next'
import { impact } from '../telegram'
const emit = defineEmits<{ close: [completed: boolean] }>()
const remaining = ref(180), phase = ref(0)
const phases = [{ name: 'Вдох', seconds: 4 }, { name: 'Задержка', seconds: 7 }, { name: 'Выдох', seconds: 8 }]
let phaseSeconds = 0
const timer = window.setInterval(() => { remaining.value = Math.max(0, remaining.value - 1); phaseSeconds++; if (phaseSeconds >= phases[phase.value].seconds) { phase.value = (phase.value + 1) % phases.length; phaseSeconds = 0; impact('light') } }, 1000)
onBeforeUnmount(() => clearInterval(timer))
const clock = computed(() => `${Math.floor(remaining.value / 60)}:${String(remaining.value % 60).padStart(2, '0')}`)
const phaseText = computed(() => `${phases[phase.value].name} ${phases[phase.value].seconds}с`)
</script>
<template><div class="modal-backdrop"><section class="sos-modal"><button class="close" @click="emit('close', false)"><X/></button><p class="section-label">ПЕРЕТЕРПИ ВСЕГО</p><h2>{{ clock }}</h2><p class="muted">Тяга пройдёт. Дыши вместе с кругом.</p><div class="breathing-wrap"><div class="breathing-circle" :class="`phase-${phase}`"><span>{{ phaseText }}</span></div></div><p class="quote">«Ты не лишаешь себя сигареты — ты выбираешь свободу.»</p><button class="primary success" @click="emit('close', true)"><CheckCircle2 :size="20"/> Попустило, закрыть</button></section></div></template>
