<script setup lang="ts">
import { House, HeartPulse, Target, History } from 'lucide-vue-next'
defineProps<{ active: string }>()
defineEmits<{ change: [tab: string] }>()
const tabs = [{ id: 'home', text: 'Главная', icon: House }, { id: 'health', text: 'Здоровье', icon: HeartPulse }, { id: 'goals', text: 'Цели', icon: Target }, { id: 'history', text: 'История', icon: History }]
</script>
<template><nav class="tabbar"><button v-for="tab in tabs" :key="tab.id" :class="{ active: active === tab.id }" @click="$emit('change', tab.id)"><component :is="tab.icon" :size="22"/><span>{{ tab.text }}</span></button></nav></template>
