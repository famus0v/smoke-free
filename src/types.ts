export type ModuleId = 'hub' | 'smoking' | 'fitness' | 'finance' | 'work'
export type ExpenseCategory = 'food' | 'sport' | 'fixed' | 'fun'

// Legacy smoke-free tracker compatibility.
export interface CravingContext {
  location?: 'home' | 'work' | 'street' | 'car' | 'bar'
  social?: 'alone' | 'friends' | 'colleagues'
  emotion?: 'stress' | 'boredom' | 'after_meal' | 'coffee_alcohol'
}
export interface CravingLog { id: string; timestamp: string; intensity: 1 | 2 | 3 | 4 | 5; triggerContext: CravingContext; note?: string }
export interface SlipLog { id: string; timestamp: string; count: number; reason: string }
export interface UserProfile { quitDate: string; cigarettesPerDay: number; pricePerPack: number; cigarettesInPack: number }
export interface WishlistItem { id: string; title: string; cost: number; isUnlocked: boolean }
export interface TrackerData { profile: UserProfile | null; cravings: CravingLog[]; slips: SlipLog[]; wishlist: WishlistItem[] }

export interface AppStorageState {
  version: number
  activeModule: ModuleId
  smoking: {
    quitDate: string
    cigarettesPerDay: number
    pricePerPack: number
    cigarettesInPack: number
    cravings: Array<{ id: string; timestamp: string; intensity: 1 | 2 | 3 | 4 | 5; trigger: string }>
    slips: Array<{ id: string; timestamp: string; count: number; reason: string }>
  }
  fitness: {
    activeSplit: string
    workouts: Array<{
      id: string
      date: string
      exercise: string
      sets: Array<{ reps: number; weight: number; completed: boolean }>
    }>
    lastRestTimeSeconds: number
  }
  finance: {
    monthlyBudget: number
    currency: string
    expenses: Array<{ id: string; date: string; amount: number; category: ExpenseCategory; note?: string }>
    wishlist: Array<{ id: string; title: string; cost: number; unlocked: boolean }>
  }
  work: {
    dailyFocusTasks: Array<{ id: string; title: string; completed: boolean }>
    scratchpad: string
  }
}
