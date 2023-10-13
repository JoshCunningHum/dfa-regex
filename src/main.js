import { createApp } from 'vue'
import App from './App.vue'
import './index.css';
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'

import '@mdi/font/css/materialdesignicons.css'

const pinia = createPinia()

loadFonts()

createApp(App)
  .use(pinia)
  .use(vuetify)
  .mount('#app')
