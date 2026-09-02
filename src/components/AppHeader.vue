<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
defineProps<{ title?: string }>()
defineEmits<{ settings: [] }>()
</script>
<template><header class="app-header"><div><p class="eyebrow">SMOKE FREE</p><h1>{{ title || 'Сегодня без дыма' }}</h1></div><button class="round-button" aria-label="Настройки" @click="$emit('settings')"><Settings :size="21" /></button></header></template>
