<script setup lang="ts">
interface Props { title: string; description: string; progress: number; complete: boolean }
defineProps<Props>()
</script>
<template><article class="milestone"><div class="milestone-top"><div><h3>{{ title }}</h3><p>{{ description }}</p></div><span :class="{ done: complete }">{{ complete ? 'Готово' : `${progress}%` }}</span></div><div class="progress"><i :style="{ width: `${progress}%` }"/></div></article></template>
