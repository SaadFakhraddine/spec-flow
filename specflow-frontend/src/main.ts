import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { bootAppearance } from '@/composables/useAppearance'
import { router } from './router'
import './assets/main.css'

bootAppearance()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
