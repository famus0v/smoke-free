/// <reference types="vite/client" />

interface TelegramBackButton {
  show(): void
  hide(): void
  onClick(callback: () => void): void
  offClick(callback: () => void): void
}

interface TelegramWebApp {
  ready(): void
  expand(): void
  colorScheme: 'light' | 'dark'
  BackButton: TelegramBackButton
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  shareToStory?(mediaUrl: string, params?: { text?: string }): void
}

interface Window { Telegram?: { WebApp: TelegramWebApp } }
