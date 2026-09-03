<script setup lang="ts">
import { House, LayoutGrid, Settings } from 'lucide-vue-next'
defineProps<{ active: string }>()
defineEmits<{ change: [tab: string] }>()
const tabs = [{ id: 'home', text: 'Главная', icon: House }, { id: 'modules', text: 'Модули', icon: LayoutGrid }, { id: 'settings', text: 'Настройки', icon: Settings }]
</script>
<template><nav class="tabbar"><button v-for="tab in tabs" :key="tab.id" :class="{ active: active === tab.id }" @click="$emit('change', tab.id)"><component :is="tab.icon" :size="22"/><span>{{ tab.text }}</span></button></nav></template>
