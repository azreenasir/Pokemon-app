<script>
// Import
import { onMounted, ref, watch } from 'vue'
import { usePokemonStore } from '@/stores/pokemon'
import { storeToRefs } from 'pinia'
import PokemonCard from '../components/PokemonCard.vue'
import { debounce } from 'lodash' // for debounce optimize search

export default {
  components: { PokemonCard },
  setup() {
    const store = usePokemonStore()
    const query = ref('')

    // Destructure reactive properties using storeToRefs
    const { pokemons, isLoading, error, paginatedPokemons, currentPage, totalPages } =
      storeToRefs(store)

    // Debounced function to reduce API/store updates on each keystroke
    const debouncedSearch = debounce((value) => {
      store.setSearch(value)
    }, 300)

    // Watcher: triggers debounced search when query changes
    watch(query, (val) => {
      debouncedSearch(val)
    })

    // Fetch Pokémon data when component is mounted
    onMounted(() => {
      store.fetchPokemons(100)
    })

    return { store, pokemons, isLoading, error, paginatedPokemons, currentPage, totalPages, query }
  },
}
</script>

<template>
  <div class="container py-4">
    <!-- Pokemon Logo -->
    <div class="text-center mb-4"><img src="../assets/Pokemon_Logo.png" alt="" /></div>

    <!-- Search Input -->
    <input
      type="text"
      class="form-control mb-3"
      placeholder="Search Pokemon"
      v-model="query"
      @input="(e) => store.setSearch(e.target.value)"
    />

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Display when no result found for search input -->
    <div v-else-if="paginatedPokemons.length === 0" class="text-center text-muted">
      No Pokémon found.
    </div>

    <!-- Layout grid -->
    <div class="d-flex justify-content-center flex-wrap gap-4">
      <div v-for="pokemon in paginatedPokemons" :key="pokemon.id" style="width: 250px">
        <!-- Display Card Component -->
        <PokemonCard :pokemon="pokemon" />
      </div>
    </div>

    <!-- Pagination -->
    <nav class="mt-4 d-flex justify-content-center" v-if="totalPages > 1">
      <!-- Previous button -->
      <ul class="pagination flex-wrap justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="store.setPage(currentPage - 1)">Previous</button>
        </li>
        <!-- Page number button -->
        <li
          class="page-item"
          v-for="page in totalPages"
          :key="page"
          :class="{ active: currentPage === page }"
        >
          <button class="page-link" @click="store.setPage(page)">{{ page }}</button>
        </li>
        <!-- Next button -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="store.setPage(currentPage + 1)">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>
