import App from './App.vue'
import i18n from './i18n'
import store from './store'
import '@renderer/assets/css/index.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'

const app = createApp(App)
app.use(store)
app.use(i18n)
app.mount('#app')
