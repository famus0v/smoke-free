type HapticType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'success' | 'error' | 'warning'
type TelegramHaptics = { impactOccurred: (type: HapticType) => void; notificationOccurred: (type: NotificationType) => void }
declare global { interface Window { Telegram?: { WebApp?: { ready?: () => void; expand?: () => void; colorScheme?: 'light' | 'dark'; HapticFeedback?: TelegramHaptics } } } }
const app = () => window.Telegram?.WebApp
const vibrate = (pattern: number | number[]) => { try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern) } catch { /* unsupported browser */ } }
export function setupTelegram() { const webApp = app(); if (!webApp) return; document.documentElement.dataset.platform = 'telegram'; document.documentElement.dataset.theme = webApp.colorScheme || ''; webApp.ready?.(); webApp.expand?.() }
export function impact(type: HapticType = 'light') { try { const haptic = app()?.HapticFeedback; if (haptic) { haptic.impactOccurred(type); return } } catch { /* browser fallback */ } vibrate(type === 'light' ? 12 : type === 'heavy' ? 28 : 20) }
export function notify(type: NotificationType = 'success') { try { const haptic = app()?.HapticFeedback; if (haptic) { haptic.notificationOccurred(type); return } } catch { /* browser fallback */ } vibrate(type === 'success' ? [10, 42, 16] : type === 'warning' ? [22, 35, 22] : [28, 48, 28]) }