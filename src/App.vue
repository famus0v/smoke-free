<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TgHeader from '@/components/common/TgHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { impact } from '@/telegram'

const route = useRoute()
const router = useRouter()
const activeTab = computed(() => route.path === '/' ? 'home' : route.path === '/settings' ? 'settings' : 'modules')
const changeTab = (tab: string) => {
  impact('light')
  router.push(tab === 'home' ? '/' : tab === 'settings' ? '/settings' : '/modules')
}
</script>

<template>
  <main class="app-shell life-shell">
    <TgHeader @open-selector="changeTab('modules')" />
    <RouterView />
    <BottomNavigation :active="activeTab" @change="changeTab" />
  </main>
</template>
