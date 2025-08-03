// Pinia store to manage Pokemon state, including fetching, searching, pagination, and edits

import { defineStore } from 'pinia'
import axios from 'axios'

// Timeout handler
let searchTimeout = null

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    pokemons: [], // All fetched Pokémon details
    isLoading: false, // Loading indicator
    error: null, // Error message, if any
    currentPage: 1, // Current page number for pagination
    perPage: 8, // Number of Pokemon per page
    searchQuery: '', // Search Query
    editedPokemons: {}, // Storage for edited Pokemon
  }),

  // Actions handle asynchronous logic and state change
  actions: {
    // Fetch Pokemon list from the API
    async fetchPokemons(limit = 100) {
      this.isLoading = true
      this.error = null
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`)
        const results = res.data.results

        // Fetch info for each Pokemon
        const details = await Promise.all(
          results.map((p) => axios.get(p.url).then((res) => res.data)),
        )

        this.pokemons = details
      } catch (err) {
        this.error = 'Failed to load Pokémon.'
        console.log(err)
      } finally {
        this.isLoading = false
      }
    },
    // Set the current page
    setPage(page) {
      this.currentPage = page
    },
    // Set search query with debounce
    setSearch(query) {
      this.searchQuery = query.toLowerCase()
      this.currentPage = 1

      this.isLoading = true
      clearTimeout(searchTimeout)

      searchTimeout = setTimeout(() => {
        if (!this.searchQuery) {
          this.filtered = this.pokemons
        } else {
          this.filtered = this.pokemons.filter((p) =>
            p.name.toLowerCase().includes(this.searchQuery),
          )
        }

        this.isLoading = false
      }, 300)
    },
    // Store edited Pokemon data using name
    saveEditedPokemon(name, data) {
      this.editedPokemons[name] = data
    },
  },

  getters: {
    // Filter Pokemon based on the current search
    filteredPokemons: (state) =>
      state.searchQuery
        ? state.pokemons.filter((p) => p.name.toLowerCase().includes(state.searchQuery))
        : state.pokemons,

    // Get current paginated Pokemon to display
    paginatedPokemons: (state) => {
      const start = (state.currentPage - 1) * state.perPage
      return state.filteredPokemons.slice(start, start + state.perPage)
    },

    //  Total pages for pagination
    totalPages: (state) => Math.ceil(state.filteredPokemons.length / state.perPage),

    // Retrieve edited Pokemon data
    getEditedPokemon: (state) => {
      return (name) => state.editedPokemons[name] || null
    },
  },
})
