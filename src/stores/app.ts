import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { AppStorageState, ExpenseCategory, ModuleId } from '@/types'

const isoNow = () => new Date().toISOString()
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export const createDefaultState = (): AppStorageState => ({
  version: 1,
  activeModule: 'hub',
  smoking: { quitDate: isoNow(), cigarettesPerDay: 15, pricePerPack: 250, cigarettesInPack: 20, cravings: [], slips: [] },
  fitness: { activeSplit: 'Push', workouts: [], lastRestTimeSeconds: 90 },
  finance: {
    monthlyBudget: 90000,
    currency: '₽',
    expenses: [],
    wishlist: [
      { id: uid(), title: 'Новые кроссовки', cost: 12000, unlocked: false },
      { id: uid(), title: 'Массаж', cost: 4500, unlocked: true },
    ],
  },
  work: { dailyFocusTasks: [], scratchpad: '' },
})

export const useAppStore = defineStore('app', () => {
  const state = useStorage<AppStorageState>('life-os-state', createDefaultState(), localStorage, { mergeDefaults: true })
  const cleanDays = computed(() => Math.max(0, Math.floor((Date.now() - new Date(state.value.smoking.quitDate).getTime()) / 86400000)))
  const savedMoney = computed(() => Math.max(0, cleanDays.value * state.value.smoking.cigarettesPerDay * state.value.smoking.pricePerPack / state.value.smoking.cigarettesInPack))
  const monthExpenses = computed(() => {
    const key = new Date().toISOString().slice(0, 7)
    return state.value.finance.expenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0)
  })
  const safeToSpend = computed(() => {
    const now = new Date()
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1
    return Math.max(0, (state.value.finance.monthlyBudget - monthExpenses.value) / daysLeft)
  })

  const setActiveModule = (module: ModuleId) => { state.value.activeModule = module }
  const addCraving = (intensity: 1 | 2 | 3 | 4 | 5, trigger: string) => state.value.smoking.cravings.unshift({ id: uid(), timestamp: isoNow(), intensity, trigger })
  const addSlip = (count: number, reason: string) => state.value.smoking.slips.unshift({ id: uid(), timestamp: isoNow(), count, reason })
  const addExpense = (amount: number, category: ExpenseCategory, note?: string) => state.value.finance.expenses.unshift({ id: uid(), date: isoNow(), amount, category, note })
  const addTask = (title: string) => {
    if (state.value.work.dailyFocusTasks.length >= 3 || !title.trim()) return false
    state.value.work.dailyFocusTasks.push({ id: uid(), title: title.trim(), completed: false })
    return true
  }
  const reset = () => { state.value = createDefaultState() }
  const importState = (value: unknown) => {
    if (!value || typeof value !== 'object' || !('version' in value)) throw new Error('Неверный формат файла')
    state.value = { ...createDefaultState(), ...(value as AppStorageState) }
  }

  return { state, cleanDays, savedMoney, monthExpenses, safeToSpend, setActiveModule, addCraving, addSlip, addExpense, addTask, reset, importState }
})
