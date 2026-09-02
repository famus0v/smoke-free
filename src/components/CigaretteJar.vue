<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps<{ cigarettes: number }>()
const canvas = ref<HTMLCanvasElement>()
const capacity = 120
const shown = computed(() => Math.min(capacity, Math.floor(props.cigarettes)))
const jars = computed(() => Math.max(1, Math.ceil(props.cigarettes / capacity)))
let frame = 0
let animation = 0
const draw = () => {
  const element = canvas.value
  if (!element) return
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const width = element.clientWidth
  const height = element.clientHeight
  if (element.width !== width * ratio || element.height !== height * ratio) { element.width = width * ratio; element.height = height * ratio }
  const ctx = element.getContext('2d')
  if (!ctx) return
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, width, height)
  const jar = { x: width * .16, y: 36, w: width * .68, h: height - 55 }
  ctx.fillStyle = 'rgba(255,255,255,.26)'
  ctx.beginPath(); ctx.roundRect(jar.x, jar.y, jar.w, jar.h, 28); ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(jar.x, jar.y, jar.w, jar.h, 28); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.fillRect(jar.x + jar.w * .2, jar.y + 3, jar.w * .6, 8)
  const cols = 10, rows = 12, count = shown.value
  for (let index = 0; index < count; index++) {
    const col = index % cols, row = Math.floor(index / cols)
    const targetX = jar.x + 16 + col * ((jar.w - 32) / (cols - 1)) + ((row % 2) * 3)
    const targetY = jar.y + jar.h - 20 - row * ((jar.h - 46) / rows)
    const delay = index * 20
    const progress = Math.min(1, Math.max(0, (performance.now() - delay) / 620))
    const ease = 1 - Math.pow(1 - progress, 3)
    const y = -16 + (targetY + 16) * ease + Math.sin((performance.now() + index * 35) / 160) * (1 - ease) * 4
    ctx.save(); ctx.translate(targetX, y); ctx.rotate(((index % 5) - 2) * .08)
    ctx.fillStyle = '#f8f3e8'; ctx.fillRect(-5, -17, 10, 34)
    ctx.fillStyle = '#d6a46b'; ctx.fillRect(-5, 7, 10, 10)
    ctx.fillStyle = 'rgba(16,24,40,.11)'; ctx.fillRect(-5, -17, 10, 2)
    ctx.restore()
  }
  ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '700 13px -apple-system, BlinkMacSystemFont, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`${shown.value} из ${capacity} в этой банке`, width / 2, height - 15)
  animation = requestAnimationFrame(draw)
}
onMounted(() => animation = requestAnimationFrame(draw))
onBeforeUnmount(() => cancelAnimationFrame(animation))
</script>
<template><section class="jar-visual"><canvas ref="canvas" class="jar-canvas"/><div class="jar-caption"><b v-if="cigarettes <= capacity">Ты не заполнил эту банку</b><b v-else>Это {{ jars }} {{ jars === 1 ? 'банка' : 'банки' }} невыкуренных сигарет</b><span>Каждая палочка — выбор в пользу себя.</span></div></section></template>