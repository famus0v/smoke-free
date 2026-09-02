<script setup lang="ts">
interface Props { value: string; label: string; tone?: 'green' | 'blue' | 'purple' }
defineProps<Props>()
</script>
<template><div class="metric-card" :class="tone"><strong>{{ value }}</strong><span>{{ label }}</span></div></template>
