import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CravingContext, CravingLog, SlipLog, TrackerData, UserProfile, WishlistItem } from '../types'

const KEY = 'smokefree_data_v1'
const defaultProfile = (): UserProfile => ({ quitDate: new Date().toISOString(), cigarettesPerDay: 15, monthlySpend: 5000, currency: '₽' })
const empty = (): TrackerData => ({ profile: defaultProfile(), cravings: [], slips: [], wishlist: [] })
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
const normalizeProfile = (value: Partial<UserProfile> | null | undefined): UserProfile => {
  if (!value) return defaultProfile()
  const legacyDailySpend = value.pricePerPack && value.cigarettesInPack ? Number(value.pricePerPack) * Math.max(1, Number(value.cigarettesPerDay) || 15) / Math.max(1, Number(value.cigarettesInPack)) : 0
  return {
    quitDate: value.quitDate || new Date().toISOString(),
    cigarettesPerDay: Math.max(1, Number(value.cigarettesPerDay) || 15),
    monthlySpend: Math.max(0, Number(value.monthlySpend) || legacyDailySpend * 30 || 5000),
    currency: value.currency || '₽',
  }
}
const restored = (): TrackerData => {
  try { const saved = JSON.parse(localStorage.getItem(KEY) || ''); return { ...empty(), ...saved, profile: normalizeProfile(saved.profile) } } catch { return empty() }
}

export const useTrackerStore = defineStore('tracker', () => {
  const data = ref<TrackerData>(restored())
  const now = ref(Date.now())
  let tick: number | undefined
  if (typeof window !== 'undefined') tick = window.setInterval(() => now.value = Date.now(), 1000)
  watch(data, value => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })

  const profile = computed(() => data.value.profile)
  const elapsedMs = computed(() => profile.value ? Math.max(0, now.value - new Date(profile.value.quitDate).getTime()) : 0)
  const elapsedDays = computed(() => elapsedMs.value / 86_400_000)
  const cigarettesNotSmoked = computed(() => profile.value ? elapsedDays.value * profile.value.cigarettesPerDay : 0)
  const moneySaved = computed(() => profile.value ? elapsedDays.value * profile.value.monthlySpend / 30 : 0)
  const slipDays = computed(() => new Set(data.value.slips.map(s => new Date(s.timestamp).toDateString())).size)
  const smokeFreeRatio = computed(() => {
    const total = Math.max(1, Math.ceil(elapsedDays.value))
    return Math.max(0, Math.round(((total - Math.min(total, slipDays.value)) / total) * 100))
  })
  const wishlist = computed(() => data.value.wishlist.map(item => ({ ...item, isUnlocked: moneySaved.value >= item.cost })))
  const totalWishlistCost = computed(() => data.value.wishlist.reduce((sum, item) => sum + item.cost, 0))

  function setProfile(value: UserProfile) { data.value.profile = normalizeProfile(value) }
  function logCraving(context: CravingContext, intensity: 1 | 2 | 3 | 4 | 5, note?: string) {
    data.value.cravings.unshift({ id: uid(), timestamp: new Date().toISOString(), intensity, triggerContext: context, note })
  }
  function logSlip(count: number, reason: string) { data.value.slips.unshift({ id: uid(), timestamp: new Date().toISOString(), count, reason }) }
  function addWishlistItem(title: string, cost: number) { data.value.wishlist.push({ id: uid(), title: title.trim(), cost, isUnlocked: moneySaved.value >= cost }) }
  function resetAllData() { data.value = empty() }
  function dispose() { if (tick) clearInterval(tick) }

  return { data, profile, elapsedMs, elapsedDays, cigarettesNotSmoked, moneySaved, smokeFreeRatio, wishlist, totalWishlistCost, setProfile, logCraving, logSlip, addWishlistItem, resetAllData, dispose }
})
