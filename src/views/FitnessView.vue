<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Dumbbell, Play, Pause, RotateCcw, Check, Plus, Timer } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { useAppStore } from '@/stores/app'
import { impact, notify } from '@/telegram'

const store=useAppStore(),router=useRouter(),exercise=ref('Жим гантелей лёжа'),rest=ref(store.state.fitness.lastRestTimeSeconds),running=ref(false)
const sets=ref([{reps:10,weight:20,completed:false},{reps:10,weight:20,completed:false},{reps:10,weight:20,completed:false}])
let timer:ReturnType<typeof setInterval>|undefined
const clearInterval=(value:ReturnType<typeof setInterval>|undefined)=>globalThis.clearInterval(value)
const clock=computed(()=>`${Math.floor(rest.value/60)}:${String(rest.value%60).padStart(2,'0')}`)
const start=()=>{clearInterval(timer);rest.value=store.state.fitness.lastRestTimeSeconds;running.value=true;timer=setInterval(()=>{rest.value--;if(rest.value<=0){clearInterval(timer);running.value=false;notify('success')}},1000)}
const toggleTimer=()=>{running.value?(clearInterval(timer),running.value=false):start();impact()}
const resetTimer=()=>{clearInterval(timer);running.value=false;rest.value=store.state.fitness.lastRestTimeSeconds;impact()}
const complete=(index:number)=>{sets.value[index].completed=!sets.value[index].completed;impact('medium');if(sets.value[index].completed)start()}
const finish=()=>{store.state.fitness.workouts.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),exercise:exercise.value,sets:sets.value.map(item=>({...item}))});notify('success')}
onBeforeUnmount(()=>clearInterval(timer))
</script>
<template>
  <section class="life-page">
    <AppHeader title="Тренировка" @settings="router.push('/settings')"/>
    <section class="module-hero fitness-hero"><span class="hero-icon"><Dumbbell :size="25"/></span><p>СЕГОДНЯШНЯЯ ПРОГРАММА</p><b>{{ store.state.fitness.activeSplit }}</b><small>Рабочие подходы без лишнего шума.</small></section>
    <div class="module-tabs three"><button v-for="split in ['Push','Pull','Legs']" :key="split" :class="{active:store.state.fitness.activeSplit===split}" @click="store.state.fitness.activeSplit=split;impact()">{{ split }}</button></div>
    <section class="rest-panel"><span><Timer :size="21"/></span><div><small>ОТДЫХ МЕЖДУ ПОДХОДАМИ</small><b>{{ clock }}</b></div><button @click="toggleTimer"><Pause v-if="running" :size="20"/><Play v-else :size="20"/></button><button class="secondary-circle" @click="clearInterval(timer);running=false;rest=store.state.fitness.lastRestTimeSeconds;impact()"><RotateCcw :size="18"/></button></section>
    <p class="section-heading">УПРАЖНЕНИЕ</p>
    <section class="group-list workout-card"><div class="workout-title"><Dumbbell :size="19"/><input v-model="exercise"/></div><div v-for="(set,index) in sets" :key="index" class="workout-row" :class="{complete:set.completed}"><b>{{ index+1 }}</b><label><input v-model.number="set.weight" type="number"/><small>кг</small></label><span>×</span><label><input v-model.number="set.reps" type="number"/><small>повт.</small></label><button @click="complete(index)"><Check :size="18"/></button></div><button class="inline-add" @click="sets.push({reps:10,weight:20,completed:false});impact()"><Plus :size="18"/> Добавить подход</button></section>
    <button class="primary module-primary" @click="finish"><Check :size="20"/> Завершить тренировку</button>
    <p class="section-heading">НЕДАВНИЕ</p><div class="group-list"><div v-if="!store.state.fitness.workouts.length" class="empty-row">История появится после первой тренировки</div><div v-for="item in store.state.fitness.workouts.slice(0,3)" :key="item.id" class="simple-row"><span><b>{{ item.exercise }}</b><small>{{ new Date(item.date).toLocaleDateString('ru-RU') }}</small></span><b>{{ item.sets.length }} ×</b></div></div>
  </section>
</template>
