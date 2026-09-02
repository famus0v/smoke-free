<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import type { CravingContext } from '../types'
const emit = defineEmits<{ close: []; save: [context: CravingContext, intensity: 1|2|3|4|5, note: string] }>()
const place = ref<CravingContext['location']>(), emotion = ref<CravingContext['emotion']>(), intensity = ref<1|2|3|4|5>(3), note = ref('')
const save = () => emit('save', { location: place.value, emotion: emotion.value }, intensity.value, note.value)
</script>
<template><div class="sheet-backdrop" @click.self="emit('close')"><section class="sheet"><div class="sheet-handle"/><div class="sheet-title"><h2>Записать тягу</h2><button @click="emit('close')"><X/></button></div><label>Где вы сейчас?</label><div class="chips"><button v-for="x in [['home','Дома'],['work','На работе'],['street','На улице'],['car','В машине'],['bar','В баре']]" :key="x[0]" :class="{ selected: place === x[0] }" @click="place = x[0] as CravingContext['location']">{{ x[1] }}</button></div><label>Что спровоцировало?</label><div class="chips"><button v-for="x in [['stress','Стресс'],['boredom','Скука'],['after_meal','После еды'],['coffee_alcohol','Кофе / алкоголь']]" :key="x[0]" :class="{ selected: emotion === x[0] }" @click="emotion = x[0] as CravingContext['emotion']">{{ x[1] }}</button></div><label>Сила тяги: <b>{{ intensity }}/5</b></label><input v-model.number="intensity" min="1" max="5" type="range"/><input v-model="note" class="text-input" placeholder="Комментарий (необязательно)"/><button class="primary" @click="save">Сохранить</button></section></div></template>
