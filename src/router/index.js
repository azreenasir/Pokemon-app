// Import Router
import { createRouter, createWebHistory } from 'vue-router'
// Import Component
import HomeView from '../views/HomeView.vue'
import PokemonDetail from '@/components/PokemonDetail.vue'

// Create vue Router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Application routes
  routes: [
    {
      // home
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // pokemon details
    {
      path: '/pokemon/:name',
      name: 'PokemonDetail',
      component: PokemonDetail,
    },
    // invalid route 404 page
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
