import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import './life.css'
import { tg } from './lib/telegram'
import { setupTelegram } from './telegram'

setupTelegram()
tg?.ready()
tg?.expand()
tg?.requestFullscreen?.()
tg?.disableVerticalSwipes?.()

createApp(App).use(createPinia()).use(router).mount('#app')
