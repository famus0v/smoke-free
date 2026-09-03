<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Focus, Plus, Check, Play, Pause, RotateCcw } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { useAppStore } from '@/stores/app'
import { impact, notify } from '@/telegram'

const store=useAppStore(),router=useRouter(),title=ref(''),seconds=ref(25*60),running=ref(false)
let timer:ReturnType<typeof setInterval>|undefined
const done=computed(()=>store.state.work.dailyFocusTasks.filter(item=>item.completed).length)
const clock=computed(()=>`${String(Math.floor(seconds.value/60)).padStart(2,'0')}:${String(seconds.value%60).padStart(2,'0')}`)
const add=()=>{if(store.addTask(title.value)){title.value='';impact()}else notify('warning')}
const toggle=(id:string)=>{const item=store.state.work.dailyFocusTasks.find(task=>task.id===id);if(item){item.completed=!item.completed;impact('medium')}}
const toggleTimer=()=>{if(running.value){clearInterval(timer);running.value=false}else{running.value=true;timer=setInterval(()=>{seconds.value--;if(seconds.value<=0){clearInterval(timer);running.value=false;seconds.value=25*60;notify('success')}},1000)}impact()}
const reset=()=>{clearInterval(timer);running.value=false;seconds.value=25*60;impact()}
onBeforeUnmount(()=>clearInterval(timer))
</script>
<template>
  <section class="life-page">
    <AppHeader title="Фокус" @settings="router.push('/settings')"/>
    <section class="module-hero work-hero"><span class="hero-icon"><Focus :size="25"/></span><p>ГЛАВНОЕ СЕГОДНЯ</p><b>{{ done }} из 3 завершено</b><small>Три результата, после которых день уже удался.</small><div class="hero-progress"><i :style="{width:`${done/3*100}%`}"/></div></section>
    <p class="section-heading">ПРАВИЛО ТРЁХ</p>
    <div class="group-list task-group"><button v-for="item in store.state.work.dailyFocusTasks" :key="item.id" class="focus-task" :class="{done:item.completed}" @click="toggle(item.id)"><span><Check :size="17"/></span>{{ item.title }}</button><form v-if="store.state.work.dailyFocusTasks.length<3" class="focus-add" @submit.prevent="add"><input v-model="title" maxlength="80" placeholder="Добавить важную задачу"/><button><Plus :size="19"/></button></form></div>
    <p class="section-heading">СЕССИЯ ФОКУСА</p>
    <section class="focus-timer"><span><Focus :size="22"/></span><div><small>{{ running?'НЕ ОТВЛЕКАЙСЯ':'ГОТОВ НАЧАТЬ?' }}</small><b>{{ clock }}</b></div><button @click="toggleTimer"><Pause v-if="running" :size="20"/><Play v-else :size="20"/></button><button class="secondary-circle" @click="reset"><RotateCcw :size="18"/></button></section>
    <p class="section-heading">БЫСТРЫЙ БЛОКНОТ</p><textarea v-model="store.state.work.scratchpad" class="note-card" placeholder="Мысли, идеи и всё, что не хочется держать в голове…"/><p class="autosave">Сохраняется автоматически на устройстве</p>
  </section>
</template>
