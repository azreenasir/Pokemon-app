<script setup>
// Import
import { useRoute, useRouter } from 'vue-router' // Router
import { getTypeColor } from '@/utils/typeColor' // Type Color to display

// Props
const props = defineProps({ pokemon: Object })

// Initialize router
const route = useRoute()
const router = useRouter()

// function to pokemon details page
function goToDetail() {
  router.push({
    name: 'PokemonDetail',
    params: { name: props.pokemon.name },
    query: {
      search: route.query.search,
      page: route.query.page,
    },
  })
}
</script>

<template>
  <!-- Card to display the Pokemon -->
  <div
    @click="goToDetail"
    class="card shadow-sm text-center h-100 cursor-pointer"
    style="cursor: pointer"
  >
    <!-- Image -->
    <img :src="pokemon.sprites.front_default" class="card-img-top p-3" :alt="pokemon.name" />
    <!-- Card body -->
    <div class="card-body">
      <!-- title: Pokemon name -->
      <h5 class="card-title text-capitalize">
        {{ pokemon.name }}
      </h5>
      <!-- Pokemon types (with color from getTypeColor function) -->
      <p>
        <span
          v-for="type in pokemon.types"
          :key="type.type.name"
          class="badge me-1"
          :style="{ backgroundColor: getTypeColor(type.type.name), color: '#fff' }"
        >
          {{ type.type.name }}
        </span>
      </p>
    </div>
  </div>
</template>
