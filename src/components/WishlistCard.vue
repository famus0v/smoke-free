<script setup lang="ts">
interface Props { title: string; cost: number; saved: number; currency: string; unlocked: boolean }
defineProps<Props>()
</script>
<template><article class="wishlist-card"><div><h3>{{ title }}</h3><p>{{ cost.toLocaleString('ru-RU') }} {{ currency }}</p></div><span v-if="unlocked" class="available">Доступно!</span><span v-else>{{ Math.min(100, Math.round(saved / cost * 100)) }}%</span><div class="progress"><i :style="{ width: `${Math.min(100, saved / cost * 100)}%` }"/></div></article></template>
