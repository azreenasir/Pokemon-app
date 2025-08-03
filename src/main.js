// global styling
import './assets/main.css'

// createApp & Pinia for state management
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// root component and router for navigation
import App from './App.vue'
import router from './router'

// bootstrap css
import 'bootstrap/dist/css/bootstrap.min.css'

// application instances
const app = createApp(App)

// register Pinia & Vue Router
app.use(createPinia())
app.use(router)

// app Mount
app.mount('#app')
