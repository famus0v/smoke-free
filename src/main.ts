import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles.css'
import { tg } from './lib/telegram'

tg?.ready()
tg?.expand()

createApp(App).use(createPinia()).use(router).mount('#app')
