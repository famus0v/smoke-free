<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Plus, Check, Play, Pause, RotateCcw, Brain } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'

const store=useAppStore();const task=ref('');const focusSeconds=ref(25*60);const running=ref(false);let interval:ReturnType<typeof setInterval>|undefined
const done=computed(()=>store.state.work.dailyFocusTasks.filter(t=>t.completed).length)
const focusLabel=computed(()=>`${String(Math.floor(focusSeconds.value/60)).padStart(2,'0')}:${String(focusSeconds.value%60).padStart(2,'0')}`)
const add=()=>{if(store.addTask(task.value)){task.value='';haptic('light')}else notify('warning')}
const toggle=(id:string)=>{const item=store.state.work.dailyFocusTasks.find(t=>t.id===id);if(item){item.completed=!item.completed;haptic('medium')}}
const toggleTimer=()=>{haptic('light');if(running.value){clearInterval(interval);running.value=false;return}running.value=true;interval=setInterval(()=>{focusSeconds.value--;if(focusSeconds.value<=0){clearInterval(interval);running.value=false;focusSeconds.value=25*60;notify('success')}},1000)}
const reset=()=>{clearInterval(interval);running.value=false;focusSeconds.value=25*60;haptic('light')}
onBeforeUnmount(()=>clearInterval(interval))
</script>

<template>
  <section class="screen">
    <p class="eyebrow">Правило трёх</p><h1 class="screen-title">Главное сегодня</h1><p class="screen-subtitle">Три результата, после которых день уже удался.</p>
    <div class="focus-progress"><span>{{ done }} из 3 завершено</span><b>{{ Math.round(done/3*100) }}%</b></div><div class="progress"><span :style="{width:`${done/3*100}%`,background:'var(--purple)'}" /></div>
    <div class="card task-list">
      <button v-for="item in store.state.work.dailyFocusTasks" :key="item.id" class="task-row" :class="{done:item.completed}" @click="toggle(item.id)"><span class="checkbox"><Check :size="17" /></span><span>{{ item.title }}</span></button>
      <form v-if="store.state.work.dailyFocusTasks.length<3" class="task-add" @submit.prevent="add"><input v-model="task" maxlength="80" placeholder="Добавить важную задачу" /><button aria-label="Добавить"><Plus :size="19" /></button></form>
    </div>
    <h2 class="section-title">Сессия фокуса</h2>
    <div class="timer card"><span class="brain"><Brain :size="23" /></span><div><small>{{ running?'Не отвлекайтесь':'Готовы начать?' }}</small><strong class="value">{{ focusLabel }}</strong></div><button @click="toggleTimer"><Pause v-if="running" :size="20" fill="currentColor"/><Play v-else :size="20" fill="currentColor"/></button><button class="reset" @click="reset"><RotateCcw :size="18"/></button></div>
    <h2 class="section-title">Быстрый блокнот</h2>
    <textarea v-model="store.state.work.scratchpad" class="scratch card" placeholder="Мысли, идеи и всё, что не хочется держать в голове…" />
    <p class="saved">Сохраняется автоматически на устройстве</p>
  </section>
</template>

<style scoped>
.focus-progress{display:flex;justify-content:space-between;margin:0 3px 8px;color:var(--secondary);font-size:13px}.focus-progress b{color:var(--purple)}.task-list{margin-top:14px}.task-row{width:100%;min-height:57px;padding:10px 14px;border:0;color:var(--text);background:transparent;display:flex;align-items:center;gap:12px;text-align:left;font-weight:600}.task-row+.task-row{border-top:.5px solid var(--separator)}.checkbox{width:28px;height:28px;border:2px solid var(--tertiary);border-radius:9px;color:transparent;display:grid;place-items:center;flex:none}.task-row.done{color:var(--secondary);text-decoration:line-through}.task-row.done .checkbox{border-color:var(--purple);color:white;background:var(--purple)}.task-add{min-height:57px;padding:8px 10px 8px 14px;border-top:.5px solid var(--separator);display:flex;align-items:center}.task-add input{min-width:0;flex:1;border:0;outline:0;color:var(--text);background:transparent}.task-add button{width:34px;height:34px;border:0;border-radius:9px;color:white;background:var(--purple);display:grid;place-items:center}.timer{padding:15px;display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,var(--card),rgba(191,90,242,.1))}.brain{width:44px;height:44px;border-radius:13px;color:var(--purple);background:rgba(191,90,242,.13);display:grid;place-items:center}.timer>div{display:grid;gap:2px;flex:1}.timer small{color:var(--secondary)}.timer strong{font-size:27px}.timer button{width:44px;height:44px;border:0;border-radius:50%;color:white;background:var(--purple);display:grid;place-items:center}.timer button.reset{width:34px;height:34px;color:var(--secondary);background:var(--pressed)}.scratch{display:block;width:100%;min-height:155px;padding:15px;border:0;outline:0;resize:vertical;color:var(--text);line-height:1.45}.saved{text-align:center;color:var(--tertiary);font-size:11px}
</style>
