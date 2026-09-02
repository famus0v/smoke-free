<script setup lang="ts">
import type { Component } from 'vue'
interface Props { value: string; label: string; tone?: 'green' | 'blue' | 'purple'; icon?: Component }
defineProps<Props>()
</script>
<template><div class="metric-card" :class="tone"><component :is="icon" v-if="icon" :size="20"/><strong>{{ value }}</strong><span>{{ label }}</span></div></template>