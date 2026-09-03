<script setup lang="ts">
import { ref } from 'vue'
import TgHeader from '@/components/common/TgHeader.vue'
import ModuleSelectorSheet from '@/components/common/ModuleSelectorSheet.vue'

const selectorOpen = ref(false)
</script>

<template>
  <div class="app-shell">
    <TgHeader @open-selector="selectorOpen = true" />
    <main class="page-wrap"><RouterView /></main>
    <ModuleSelectorSheet v-model="selectorOpen" />
  </div>
</template>
