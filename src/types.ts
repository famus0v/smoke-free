export interface UserProfile {
  quitDate: string
  cigarettesPerDay: number
  pricePerPack: number
  cigarettesInPack: number
  currency: string
}

export interface CravingContext {
  location?: 'home' | 'work' | 'street' | 'car' | 'bar'
  social?: 'alone' | 'friends' | 'colleagues'
  emotion?: 'stress' | 'boredom' | 'after_meal' | 'coffee_alcohol'
}

export interface CravingLog { id: string; timestamp: string; intensity: 1 | 2 | 3 | 4 | 5; triggerContext: CravingContext; note?: string }
export interface SlipLog { id: string; timestamp: string; count: number; reason: string }
export interface WishlistItem { id: string; title: string; cost: number; isUnlocked: boolean }
export interface TrackerData { profile: UserProfile | null; cravings: CravingLog[]; slips: SlipLog[]; wishlist: WishlistItem[] }
