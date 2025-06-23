import { createApp } from 'vue'
import { Quasar } from 'quasar'

import pinia from './stores'
import router from './router'

// Quasar css
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  config: {
    brand: {}
  }
})

app.use(router)
app.use(pinia)

app.mount('#app')
