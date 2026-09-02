import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { setupTelegram } from './telegram'

setupTelegram()
createApp(App).use(createPinia()).mount('#app')
