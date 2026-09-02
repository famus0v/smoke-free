type HapticType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'success' | 'error' | 'warning'
type TelegramHaptics = { impactOccurred: (type: HapticType) => void; notificationOccurred: (type: NotificationType) => void }
type CapacitorHaptics = { impact?: (options: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => void; notification?: (options: { type: 'SUCCESS' | 'ERROR' | 'WARNING' }) => void }
declare global { interface Window { Telegram?: { WebApp?: { ready?: () => void; expand?: () => void; colorScheme?: 'light' | 'dark'; HapticFeedback?: TelegramHaptics } }; Capacitor?: { Plugins?: { Haptics?: CapacitorHaptics } } } }

const app = () => window.Telegram?.WebApp
const vibrate = (pattern: number | number[]) => { try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern) } catch { /* unsupported platform */ } }
export function setupTelegram() {
  app()?.ready?.()
  app()?.expand?.()
  const scheme = app()?.colorScheme
  if (scheme) document.documentElement.dataset.theme = scheme
}
export function impact(type: HapticType = 'light') {
  try { const haptic = app()?.HapticFeedback; if (haptic) { haptic.impactOccurred(type); return }; const capacitor = window.Capacitor?.Plugins?.Haptics; if (capacitor?.impact) { capacitor.impact({ style: type === 'light' ? 'LIGHT' : type === 'heavy' ? 'HEAVY' : 'MEDIUM' }); return } } catch { /* use browser fallback */ }
  vibrate(type === 'light' ? 12 : type === 'heavy' ? 28 : 20)
}
export function notify(type: NotificationType = 'success') {
  try { const haptic = app()?.HapticFeedback; if (haptic) { haptic.notificationOccurred(type); return }; const capacitor = window.Capacitor?.Plugins?.Haptics; if (capacitor?.notification) { capacitor.notification({ type: type.toUpperCase() as 'SUCCESS' | 'ERROR' | 'WARNING' }); return } } catch { /* use browser fallback */ }
  vibrate(type === 'success' ? [10, 42, 16] : type === 'warning' ? [22, 35, 22] : [28, 48, 28])
}
