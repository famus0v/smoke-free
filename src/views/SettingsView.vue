<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download, Upload, Trash2, Database, ChevronRight } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useTrackerStore } from '@/stores/tracker'
import { haptic, notify } from '@/lib/telegram'
import type { TrackerData, UserProfile } from '@/types'

const store=useAppStore(),tracker=useTrackerStore(),file=ref<HTMLInputElement>()
const fallback=():UserProfile=>({quitDate:new Date().toISOString(),cigarettesPerDay:15,monthlySpend:5000,currency:'₽'})
const updateSmoking=(patch:Partial<UserProfile>)=>tracker.setProfile({...fallback(),...tracker.profile,...patch})
const quitDate=computed({get:()=>new Date(tracker.profile?.quitDate??Date.now()).toISOString().slice(0,16),set:(value:string)=>updateSmoking({quitDate:new Date(value).toISOString()})})
const cigarettesPerDay=computed({get:()=>tracker.profile?.cigarettesPerDay??15,set:(value:number)=>updateSmoking({cigarettesPerDay:Math.max(1,Number(value)||1)})})
const monthlySpend=computed({get:()=>tracker.profile?.monthlySpend??5000,set:(value:number)=>updateSmoking({monthlySpend:Math.max(0,Number(value)||0)})})
const exportData=()=>{const payload={version:2,app:store.state,tracker:tracker.data};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`life-os-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);notify('success')}
const importData=async(event:Event)=>{const target=event.target as HTMLInputElement;const selected=target.files?.[0];if(!selected)return;try{const value=JSON.parse(await selected.text()) as {app?:unknown;tracker?:TrackerData};if(value.app||value.tracker){if(value.app)store.importState(value.app);if(value.tracker){tracker.data=value.tracker;updateSmoking(value.tracker.profile??fallback())}}else store.importState(value);notify('success')}catch{notify('error')}finally{target.value=''}}
const reset=()=>{if(window.confirm('Удалить все локальные данные Life OS?')){store.reset();tracker.resetAllData();notify('warning')}}
</script>

<template>
  <section class="screen">
    <p class="eyebrow">Life OS</p><h1 class="screen-title">Настройки</h1><p class="screen-subtitle">Все данные живут только на этом устройстве.</p>
    <div class="privacy card inset"><span><Database :size="24" /></span><div><b>Полностью offline-first</b><p>Никаких аккаунтов, серверов и передачи личных данных.</p></div></div>
    <h2 class="section-title">Резервная копия</h2>
    <div class="card">
      <button class="settings-row" @click="exportData"><span class="icon blue"><Download :size="19" /></span><span><b>Экспортировать данные</b><small>Скачать JSON-файл</small></span><ChevronRight :size="18" /></button>
      <button class="settings-row" @click="file?.click();haptic('light')"><span class="icon green"><Upload :size="19" /></span><span><b>Импортировать данные</b><small>Восстановить из JSON</small></span><ChevronRight :size="18" /></button>
      <input ref="file" hidden type="file" accept="application/json,.json" @change="importData" />
    </div>
    <h2 class="section-title">Курение</h2>
    <div class="card smoking-settings">
      <label class="setting-row"><span>Дата и время отказа</span><input v-model="quitDate" type="datetime-local" /></label>
      <label class="setting-row"><span>Сигарет в день</span><input v-model.number="cigarettesPerDay" type="number" min="1" inputmode="numeric" /></label>
      <label class="setting-row"><span>Траты в месяц</span><span class="money-setting"><input v-model.number="monthlySpend" type="number" min="0" inputmode="decimal" /> ₽</span></label>
    </div>
    <h2 class="section-title">Бюджет</h2>
    <div class="card row budget"><span>Месячный лимит</span><label><input v-model.number="store.state.finance.monthlyBudget" type="number" inputmode="decimal" /> {{ store.state.finance.currency }}</label></div>
    <h2 class="section-title">Опасная зона</h2>
    <button class="reset-row card" @click="reset"><span class="icon red"><Trash2 :size="19" /></span><span><b>Сбросить все данные</b><small>Это действие нельзя отменить</small></span></button>
    <p class="version">Life OS · версия {{ store.state.version }}</p>
  </section>
</template>

<style scoped>
.privacy{display:flex;align-items:flex-start;gap:13px;background:linear-gradient(135deg,var(--card),rgba(48,209,88,.09))}.privacy>span{width:42px;height:42px;flex:none;border-radius:12px;color:var(--green);background:rgba(48,209,88,.12);display:grid;place-items:center}.privacy b{font-size:15px}.privacy p{margin:5px 0 0;color:var(--secondary);font-size:13px;line-height:1.4}.settings-row,.reset-row{width:100%;min-height:60px;padding:10px 13px;border:0;color:var(--text);background:transparent;display:flex;align-items:center;gap:11px;text-align:left}.settings-row+.settings-row{border-top:.5px solid var(--separator)}.settings-row>span:nth-child(2),.reset-row>span:nth-child(2){display:grid;gap:2px;flex:1}.settings-row small,.reset-row small{color:var(--secondary)}.settings-row>svg{color:var(--tertiary)}.icon{width:35px;height:35px;border-radius:9px;color:white;display:grid;place-items:center}.blue{background:var(--accent)}.green{background:var(--green)}.red{background:#ff453a}.budget{justify-content:space-between}.budget>span{flex:1}.budget label{color:var(--secondary)}.budget input{width:110px;border:0;outline:0;color:var(--text);background:transparent;text-align:right;font-weight:650}.reset-row{background:var(--card);border-radius:16px}.version{text-align:center;margin-top:28px;color:var(--tertiary);font-size:12px}
.setting-row{min-height:56px;padding:9px 14px;display:flex;align-items:center;justify-content:space-between;gap:14px}.setting-row+.setting-row{border-top:.5px solid var(--separator)}.setting-row>span:first-child{flex:1}.setting-row input{width:142px;min-height:38px;padding:7px 9px;border:0;border-radius:9px;outline:0;color:var(--text);background:var(--pressed);text-align:right;font-weight:650}.setting-row input[type="datetime-local"]{width:185px;font-size:13px}.money-setting{display:flex;align-items:center;gap:5px;color:var(--secondary)}.money-setting input{width:112px}
@media(max-width:380px){.setting-row{align-items:flex-start;flex-direction:column}.setting-row input,.setting-row input[type="datetime-local"]{width:100%;text-align:left}.money-setting{width:100%}.money-setting input{flex:1}}
</style>
