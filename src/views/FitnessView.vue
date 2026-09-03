<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Plus, Play, Pause, RotateCcw, Check, Dumbbell } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'

const store = useAppStore()
const splits = ['Push', 'Pull', 'Legs']
const exercise = ref('Жим гантелей лёжа')
const reps = ref(10)
const weight = ref(20)
const sets = ref<Array<{ reps:number; weight:number; completed:boolean }>>([
  { reps:10, weight:20, completed:false }, { reps:10, weight:20, completed:false }, { reps:10, weight:20, completed:false },
])
const rest = ref(store.state.fitness.lastRestTimeSeconds)
const restRunning = ref(false)
let interval: ReturnType<typeof setInterval> | undefined
const restLabel = computed(() => `${Math.floor(rest.value / 60)}:${String(rest.value % 60).padStart(2,'0')}`)
const addSet = () => { sets.value.push({ reps:reps.value, weight:weight.value, completed:false }); haptic('light') }
const toggleSet = (index:number) => { sets.value[index].completed = !sets.value[index].completed; haptic('medium'); if (sets.value[index].completed) startRest() }
const startRest = () => { clearInterval(interval); rest.value = store.state.fitness.lastRestTimeSeconds; restRunning.value = true; interval=setInterval(()=>{ rest.value--; if(rest.value<=0){ clearInterval(interval);restRunning.value=false;notify('success') }},1000) }
const toggleRest = () => { if(restRunning.value){ clearInterval(interval);restRunning.value=false } else startRest(); haptic('light') }
const resetRest = () => { clearInterval(interval);restRunning.value=false;rest.value=store.state.fitness.lastRestTimeSeconds;haptic('light') }
const finish = () => { store.state.fitness.workouts.unshift({ id:crypto.randomUUID(), date:new Date().toISOString(), exercise:exercise.value, sets:sets.value.map(s=>({...s})) }); notify('success') }
onBeforeUnmount(()=>clearInterval(interval))
</script>

<template>
  <section class="screen">
    <p class="eyebrow">Тренировка сегодня</p><h1 class="screen-title">{{ store.state.fitness.activeSplit }}</h1><p class="screen-subtitle">Рабочие подходы без лишнего шума.</p>
    <div class="segmented"><button v-for="split in splits" :key="split" :class="{active:store.state.fitness.activeSplit===split}" @click="store.state.fitness.activeSplit=split;haptic('light')">{{ split }}</button></div>
    <div class="timer-card card">
      <div><small>Отдых между подходами</small><strong class="value">{{ restLabel }}</strong></div>
      <button @click="toggleRest"><Pause v-if="restRunning" :size="21" fill="currentColor" /><Play v-else :size="21" fill="currentColor" /></button>
      <button class="reset" @click="resetRest"><RotateCcw :size="19" /></button>
    </div>
    <h2 class="section-title">Упражнение</h2>
    <div class="exercise card">
      <div class="exercise-head"><span class="exercise-icon"><Dumbbell :size="20" /></span><input v-model="exercise" class="name-input" aria-label="Название упражнения" /></div>
      <div class="set-labels"><span>Подход</span><span>КГ</span><span>Повт.</span><span /></div>
      <div v-for="(set,index) in sets" :key="index" class="set-row" :class="{done:set.completed}">
        <b>{{ index+1 }}</b><input v-model.number="set.weight" type="number" inputmode="decimal" /><span>×</span><input v-model.number="set.reps" type="number" inputmode="numeric" />
        <button :aria-label="`Завершить подход ${index+1}`" @click="toggleSet(index)"><Check :size="19" /></button>
      </div>
      <button class="add-set" @click="addSet"><Plus :size="17" /> Добавить подход</button>
    </div>
    <button class="primary-btn finish" @click="finish">Завершить тренировку</button>
    <h2 class="section-title">Последние тренировки</h2>
    <div class="card"><div v-if="!store.state.fitness.workouts.length" class="empty">История появится после первой тренировки</div><div v-for="workout in store.state.fitness.workouts.slice(0,3)" :key="workout.id" class="row history"><span><b>{{ workout.exercise }}</b><small>{{ new Date(workout.date).toLocaleDateString('ru-RU') }}</small></span><b>{{ workout.sets.length }} ×</b></div></div>
  </section>
</template>

<style scoped>
.timer-card{margin-top:12px;padding:15px;display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--card),rgba(255,159,10,.1))}.timer-card>div{display:grid;gap:3px;flex:1}.timer-card small{color:var(--secondary)}.timer-card strong{font-size:31px}.timer-card button{width:46px;height:46px;border:0;border-radius:50%;color:white;background:var(--orange);display:grid;place-items:center}.timer-card button.reset{width:36px;height:36px;color:var(--secondary);background:var(--pressed)}.exercise-head{padding:13px;display:flex;gap:10px;align-items:center;border-bottom:.5px solid var(--separator)}.exercise-icon{width:36px;height:36px;border-radius:10px;color:var(--orange);background:rgba(255,159,10,.12);display:grid;place-items:center}.name-input{min-width:0;flex:1;border:0;outline:0;color:var(--text);background:transparent;font-weight:700}.set-labels,.set-row{display:grid;grid-template-columns:52px 1fr 20px 1fr 42px;align-items:center;text-align:center}.set-labels{padding:8px 12px 4px;color:var(--secondary);font-size:10px;text-transform:uppercase}.set-labels span:nth-child(2){grid-column:2}.set-labels span:nth-child(3){grid-column:4}.set-row{min-height:52px;padding:5px 12px;border-top:.5px solid var(--separator)}.set-row input{width:100%;height:36px;border:0;border-radius:8px;outline:0;color:var(--text);background:var(--pressed);text-align:center;font-weight:700}.set-row>span{color:var(--secondary)}.set-row button{width:34px;height:34px;margin-left:8px;border:1px solid var(--separator);border-radius:50%;color:transparent;background:transparent;display:grid;place-items:center}.set-row.done{opacity:.62}.set-row.done button{border-color:var(--green);color:white;background:var(--green)}.add-set{width:100%;height:45px;border:0;border-top:.5px solid var(--separator);color:var(--accent);background:transparent;display:flex;align-items:center;justify-content:center;gap:5px;font-weight:650}.finish{width:100%;margin-top:12px}.empty{padding:24px;text-align:center;color:var(--secondary);font-size:13px}.history>span{display:grid;gap:2px;flex:1}.history small{color:var(--secondary)}
</style>
