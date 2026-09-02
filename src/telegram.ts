type HapticType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
declare global { interface Window { Telegram?: { WebApp?: { ready?: () => void; expand?: () => void; HapticFeedback?: { impactOccurred: (type: HapticType) => void; notificationOccurred: (type: 'success' | 'error' | 'warning') => void } } } } }

const app = () => window.Telegram?.WebApp
export function setupTelegram() { app()?.ready?.(); app()?.expand?.() }
export function impact(type: HapticType = 'light') { try { app()?.HapticFeedback?.impactOccurred(type) } catch { /* browser fallback */ } }
export function notify(type: 'success' | 'error' | 'warning' = 'success') { try { app()?.HapticFeedback?.notificationOccurred(type) } catch { /* browser fallback */ } }
