<script setup lang="ts">
import { ref } from 'vue'
import { Database, Download, Upload, Trash2, ChevronRight, ShieldCheck } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { useAppStore } from '@/stores/app'
import { useTrackerStore } from '@/stores/tracker'
import { impact, notify } from '@/telegram'
import type { TrackerData } from '@/types'

const app=useAppStore(),tracker=useTrackerStore(),file=ref<HTMLInputElement>(),resetSheet=ref(false)
const exportData=()=>{const payload={version:2,app:app.state,tracker:tracker.data};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`life-os-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);notify('success')}
const importData=async(event:Event)=>{const input=event.target as HTMLInputElement;const selected=input.files?.[0];if(!selected)return;try{const value=JSON.parse(await selected.text()) as {app?:unknown;tracker?:TrackerData};if(!value.app&&!value.tracker)throw new Error();if(value.app)app.importState(value.app);if(value.tracker)tracker.data=value.tracker;notify('success')}catch{notify('error')}finally{input.value=''}}
const resetAll=()=>{app.reset();tracker.resetAllData();resetSheet.value=false;notify('warning')}
</script>
<template>
  <section class="life-page">
    <AppHeader title="Настройки" @settings="impact()"/>
    <section class="settings-hero"><span><ShieldCheck :size="25"/></span><div><b>Данные остаются у тебя</b><p>Life OS работает без аккаунта и хранит всё только на этом устройстве.</p></div></section>
    <p class="section-heading">РЕЗЕРВНАЯ КОПИЯ</p>
    <div class="group-list settings-list"><button class="list-action" @click="exportData"><span class="list-icon blue"><Download :size="19"/></span><span><b>Экспортировать данные</b><small>Скачать единый JSON-файл</small></span><ChevronRight :size="18"/></button><button class="list-action" @click="file?.click();impact()"><span class="list-icon green"><Upload :size="19"/></span><span><b>Импортировать данные</b><small>Восстановить резервную копию</small></span><ChevronRight :size="18"/></button><input ref="file" hidden type="file" accept="application/json,.json" @change="importData"/></div>
    <p class="section-heading">БЮДЖЕТ</p><label class="setting-input group-list"><span><b>Месячный лимит</b><small>Для расчёта Safe-to-Spend</small></span><div><input v-model.number="app.state.finance.monthlyBudget" type="number"/> {{ app.state.finance.currency }}</div></label>
    <p class="section-heading">ДАННЫЕ</p><button class="danger-list-button" @click="resetSheet=true;impact('medium')"><span class="list-icon red"><Trash2 :size="19"/></span><span><b>Сбросить всё</b><small>Удалить профиль и историю с устройства</small></span></button>
    <p class="app-version">Life OS · версия {{ app.state.version }}</p>
  </section>
  <Transition name="sheet-slide"><div v-if="resetSheet" class="sheet-backdrop" @click.self="resetSheet=false"><section class="sheet confirm-sheet"><div class="sheet-handle"/><div class="sheet-title"><h2>Удалить все данные?</h2><button @click="resetSheet=false">×</button></div><p class="muted">Профиль, прогресс, тренировки, расходы и задачи будут удалены с устройства.</p><button class="danger-button" @click="resetAll">Удалить безвозвратно</button><button class="text-button" @click="resetSheet=false">Отмена</button></section></div></Transition>
</template>
