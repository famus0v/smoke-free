import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { AppStorageState, DashboardWidgetId, ExpenseCategory, ModuleId } from '@/types'

const isoNow = () => new Date().toISOString()
const dateKey = (date = new Date()) => date.toISOString().slice(0, 10)
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export const createDefaultState = (): AppStorageState => ({
  version: 1,
  activeModule: 'hub',
  dashboardWidgets: ['smoking', 'fitness', 'finance', 'work'],
  smoking: { quitDate: isoNow(), cigarettesPerDay: 15, pricePerPack: 250, cigarettesInPack: 20, cravings: [], slips: [] },
  fitness: { activeSplit: 'Push', workouts: [], lastRestTimeSeconds: 90 },
  finance: {
    monthlyBudget: 90000,
    currency: '₽',
    dailyLimitDate: '',
    dailyLimit: 0,
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
  const daysRemainingThisMonth = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1
  }
  const ensureTodayLimit = () => {
    const today = dateKey()
    const finance = state.value.finance
    if (finance.dailyLimitDate === today && Number.isFinite(finance.dailyLimit)) return
    const month = today.slice(0, 7)
    const spentBeforeToday = finance.expenses
      .filter((expense) => expense.date.startsWith(month) && expense.date.slice(0, 10) < today)
      .reduce((sum, expense) => sum + expense.amount, 0)
    finance.dailyLimit = Math.max(0, (finance.monthlyBudget - spentBeforeToday) / daysRemainingThisMonth())
    finance.dailyLimitDate = today
  }
  if (!Array.isArray(state.value.dashboardWidgets) || state.value.dashboardWidgets.length === 0) {
    state.value.dashboardWidgets = ['smoking', 'fitness', 'finance', 'work']
  }
  ensureTodayLimit()
  const cleanDays = computed(() => Math.max(0, Math.floor((Date.now() - new Date(state.value.smoking.quitDate).getTime()) / 86400000)))
  const savedMoney = computed(() => Math.max(0, cleanDays.value * state.value.smoking.cigarettesPerDay * state.value.smoking.pricePerPack / state.value.smoking.cigarettesInPack))
  const monthExpenses = computed(() => {
    const key = new Date().toISOString().slice(0, 7)
    return state.value.finance.expenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0)
  })
  const todayLimit = computed(() => { ensureTodayLimit(); return state.value.finance.dailyLimit })
  const futureDailyLimit = computed(() => {
    ensureTodayLimit()
    const remainingDays = daysRemainingThisMonth() - 1
    if (remainingDays <= 0) return 0
    return Math.max(0, (state.value.finance.monthlyBudget - monthExpenses.value) / remainingDays)
  })
  const safeToSpend = todayLimit

  const setActiveModule = (module: ModuleId) => { state.value.activeModule = module }
  const addCraving = (intensity: 1 | 2 | 3 | 4 | 5, trigger: string) => state.value.smoking.cravings.unshift({ id: uid(), timestamp: isoNow(), intensity, trigger })
  const addSlip = (count: number, reason: string) => state.value.smoking.slips.unshift({ id: uid(), timestamp: isoNow(), count, reason })
  const addExpense = (amount: number, category: ExpenseCategory, note?: string) => {
    ensureTodayLimit()
    state.value.finance.expenses.unshift({ id: uid(), date: isoNow(), amount, category, note })
  }
  const toggleDashboardWidget = (widget: DashboardWidgetId) => {
    const widgets = state.value.dashboardWidgets
    if (widgets.includes(widget)) {
      if (widgets.length > 1) state.value.dashboardWidgets = widgets.filter((item) => item !== widget)
      return
    }
    const order: DashboardWidgetId[] = ['smoking', 'fitness', 'finance', 'work']
    state.value.dashboardWidgets = order.filter((item) => [...widgets, widget].includes(item))
  }
  const addTask = (title: string) => {
    if (state.value.work.dailyFocusTasks.length >= 3 || !title.trim()) return false
    state.value.work.dailyFocusTasks.push({ id: uid(), title: title.trim(), completed: false })
    return true
  }
  const reset = () => { state.value = createDefaultState(); ensureTodayLimit() }
  const importState = (value: unknown) => {
    if (!value || typeof value !== 'object' || !('version' in value)) throw new Error('Неверный формат файла')
    state.value = { ...createDefaultState(), ...(value as AppStorageState) }
    if (!Array.isArray(state.value.dashboardWidgets) || state.value.dashboardWidgets.length === 0) state.value.dashboardWidgets = ['smoking', 'fitness', 'finance', 'work']
    ensureTodayLimit()
  }

  return { state, cleanDays, savedMoney, monthExpenses, safeToSpend, todayLimit, futureDailyLimit, setActiveModule, addCraving, addSlip, addExpense, toggleDashboardWidget, addTask, reset, importState }
})
