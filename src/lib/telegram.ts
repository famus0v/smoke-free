export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined

export const haptic = (style: 'light' | 'medium' = 'light') => {
  try { tg?.HapticFeedback?.impactOccurred(style) } catch { /* Browser fallback. */ }
}

export const notify = (type: 'error' | 'success' | 'warning') => {
  try { tg?.HapticFeedback?.notificationOccurred(type) } catch { /* Browser fallback. */ }
}
