type HapticType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'success' | 'error' | 'warning'
const vibrate = (pattern: number | number[]) => { try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern) } catch { /* unsupported browser */ } }
export const impact = (type: HapticType = 'light') => vibrate(type === 'light' ? 12 : type === 'heavy' ? 28 : 20)
export const notify = (type: NotificationType = 'success') => vibrate(type === 'success' ? [10, 42, 16] : type === 'warning' ? [22, 35, 22] : [28, 48, 28])