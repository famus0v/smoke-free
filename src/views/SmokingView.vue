<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ShieldCheck, HeartPulse, Wind, Check, RotateCcw } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { haptic, notify } from '@/lib/telegram'

const store = useAppStore()
const sosSeconds = ref(180)
const sosActive = ref(false)
let interval: ReturnType<typeof setInterval> | undefined
const money = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
const elapsed = computed(() => {
  const ms = Math.max(0, Date.now() - new Date(store.state.smoking.quitDate).getTime())
  const days = Math.floor(ms / 86400000); const hours = Math.floor(ms % 86400000 / 3600000)
  return `${days} дн. ${hours} ч.`
})
const sosLabel = computed(() => `${String(Math.floor(sosSeconds.value / 60)).padStart(2,'0')}:${String(sosSeconds.value % 60).padStart(2,'0')}`)
const toggleSos = () => {
  haptic('medium')
  if (sosActive.value) { clearInterval(interval); sosActive.value = false; sosSeconds.value = 180; return }
  sosActive.value = true
  interval = setInterval(() => { sosSeconds.value--; if (sosSeconds.value <= 0) { clearInterval(interval); sosActive.value = false; sosSeconds.value = 180; notify('success') } }, 1000)
}
const logCraving = (intensity: 1|2|3|4|5) => { store.addCraving(intensity, 'Быстрая запись'); haptic('light') }
onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <section class="screen">
    <p class="eyebrow">Свобода от никотина</p><h1 class="screen-title">Вы держитесь</h1><p class="screen-subtitle">Каждая минута уже работает на вас.</p>
    <div class="hero card">
      <div class="halo"><ShieldCheck :size="32" /></div><span>Без сигарет</span><strong class="value">{{ elapsed }}</strong>
      <div class="hero-stats"><div><b>{{ money(store.savedMoney) }} {{ store.state.finance.currency }}</b><small>сэкономлено</small></div><div><b>{{ store.cleanDays * store.state.smoking.cigarettesPerDay }}</b><small>не выкурено</small></div></div>
    </div>
    <button class="sos" :class="{ active:sosActive }" @click="toggleSos"><span>{{ sosActive ? sosLabel : 'SOS' }}</span><small>{{ sosActive ? 'Дышите медленно. Волна пройдёт.' : 'Пережить тягу за 3 минуты' }}</small></button>
    <h2 class="section-title">Сила тяги сейчас</h2>
    <div class="craving card inset"><div class="dots"><button v-for="n in 5" :key="n" :aria-label="`Тяга ${n} из 5`" @click="logCraving(n as 1|2|3|4|5)">{{ n }}</button></div><p>Нажмите, чтобы быстро отметить момент</p></div>
    <h2 class="section-title">Восстановление</h2>
    <div class="card milestones">
      <div class="row"><span class="health green"><Wind :size="19" /></span><span><b>Кислород в норме</b><small>Первые 8–12 часов</small></span><Check class="green" :size="19" /></div>
      <div class="row"><span class="health blue"><HeartPulse :size="19" /></span><span><b>Риск для сердца снижается</b><small>После первых суток</small></span><Check v-if="store.cleanDays >= 1" class="green" :size="19" /><RotateCcw v-else class="muted" :size="18" /></div>
    </div>
  </section>
</template>

<style scoped>
.hero{padding:22px 16px 0;text-align:center}.halo{width:64px;height:64px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;color:var(--green);background:rgba(48,209,88,.12);box-shadow:0 0 40px rgba(48,209,88,.11)}.hero>span{display:block;color:var(--secondary);font-size:13px}.hero>strong{display:block;margin:4px 0 20px;font-size:30px}.hero-stats{border-top:.5px solid var(--separator);display:grid;grid-template-columns:1fr 1fr}.hero-stats>div{padding:14px 8px;display:grid;gap:3px}.hero-stats>div+div{border-left:.5px solid var(--separator)}.hero-stats b{font-size:16px}.hero-stats small{color:var(--secondary);font-size:11px}.sos{width:100%;min-height:68px;margin-top:12px;border:0;border-radius:16px;color:white;background:linear-gradient(135deg,#ff453a,#ff2d55);box-shadow:0 8px 24px rgba(255,45,85,.16);display:grid;place-items:center;align-content:center}.sos span{font-size:21px;font-weight:800;letter-spacing:.03em}.sos small{margin-top:3px;opacity:.84}.sos.active{background:linear-gradient(135deg,#0a84ff,#5e5ce6)}.dots{display:flex;justify-content:space-between;gap:8px}.dots button{width:42px;height:42px;border:0;border-radius:50%;color:white;background:#3a3a3c;font-weight:700}.dots button:nth-child(1){background:#30d158}.dots button:nth-child(2){background:#a8c631}.dots button:nth-child(3){background:#ffd60a;color:#222}.dots button:nth-child(4){background:#ff9f0a}.dots button:nth-child(5){background:#ff453a}.craving p{margin:12px 0 0;text-align:center;color:var(--secondary);font-size:12px}.milestones .row>span:nth-child(2){display:grid;gap:2px;flex:1}.milestones small{color:var(--secondary)}.health{width:34px;height:34px;border-radius:9px;display:grid;place-items:center}.health.green{background:rgba(48,209,88,.12)}.health.blue{color:var(--accent);background:rgba(10,132,255,.12)}
</style>
