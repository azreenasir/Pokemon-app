<script setup>
// Import
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import router from '@/router'
import { usePokemonStore } from '@/stores/pokemon'
import { Toast } from 'bootstrap'
import { getTypeColor } from '@/utils/typeColor'

// Refs for state
const route = useRoute()
const pokemon = ref(null)
const showModal = ref(false)

// Toast
const successToast = ref(null)
const errorToast = ref(null)
let successInstance, errorInstance

// Pinia store instance
const store = usePokemonStore()

const edited = ref({ height: 0, weight: 0 })

// Fetch Pokémon details on component moun
onMounted(async () => {
  try {
    // Fetch base Pokemon name and its detail
    const name = route.params.name
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
    const apiData = res.data

    // Fetch species data for description
    const resSpecies = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
    const flavorTextEntry = resSpecies.data.flavor_text_entries.find(
      (entry) => entry.language.name === 'en',
    )

    const flavorText =
      flavorTextEntry?.flavor_text?.replace(/\f/g, ' ') || 'No description available.'

    // Add description to the fetched API data
    apiData.description = flavorText

    // Initialize Toast instances
    successInstance = new Toast(successToast.value)
    errorInstance = new Toast(errorToast.value)

    // Use overridden Pokémon data if user previously edited it
    const overridden = store.getEditedPokemon(name)
    pokemon.value = overridden || apiData
  } catch (err) {
    console.error('Failed to fetch Pokemon details', err)
  }
})

// Opens the modal
function openEditModal() {
  edited.value = {
    height: pokemon.value.height,
    weight: pokemon.value.weight,
  }
  showModal.value = true
}

// Saves edited height and weight data to the store
function saveEdit() {
  try {
    pokemon.value.height = edited.value.height
    pokemon.value.height = edited.value.weight
    store.saveEditedPokemon(pokemon.value.name, { ...pokemon.value })
    showModal.value = false
    successInstance.show()
  } catch (e) {
    errorInstance.show()
    console.log(e)
  }
}

// Navigate back to previous page
function goBack() {
  router.push({ name: 'home', query: route.query })
}
</script>

<template>
  <!-- Container -->
  <div class="container py-5 animate__animated animate__fadeIn" v-if="pokemon">
    <!-- Back Button -->
    <div class="mb-3 text-center text-md-start">
      <button @click="goBack" class="btn btn-outline-secondary">← Return</button>
    </div>

    <!-- Pokemon name -->
    <h2 class="text-center text-capitalize fw-bold mb-4 display-5">{{ pokemon.name }}</h2>

    <!-- Edited Pokemon indicator -->
    <p v-if="store.getEditedPokemon(pokemon.name)" class="text-center text-muted small fst-italic">
      (This Pokémon has been edited)
    </p>

    <!-- Pokemon Image -->
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-md-6 text-center">
        <img
          :src="pokemon.sprites.other['official-artwork'].front_default"
          alt="pokemon"
          class="img-fluid"
          style="max-height: 300px"
        />
      </div>
    </div>

    <!-- Card Section for Pokemon Details  -->
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card p-4 shadow-lg rounded-4 border-0 bg-white">
          <!-- Description -->
          <div class="mb-3">
            <p class="fst-italic">{{ pokemon.description }}</p>
          </div>
          <!-- Stats -->
          <div class="mb-4">
            <h5 class="fw-bold"><i class="bi bi-bar-chart-fill me-2"></i> Stats</h5>
            <ul class="list-group list-group-flush">
              <li
                v-for="stat in pokemon.stats"
                :key="stat.stat.name"
                class="mb-2"
                style="list-style-type: none"
              >
                <div class="d-flex justify-content-between">
                  <span class="text-capitalize">{{ stat.stat.name }}</span>
                  <span>{{ stat.base_stat }}</span>
                </div>
                <div class="progress">
                  <div
                    class="progress-bar"
                    :style="{ width: stat.base_stat + '%' }"
                    role="progressbar"
                  ></div>
                </div>
              </li>
            </ul>
          </div>
          <!-- Abilities -->
          <div class="mb-4">
            <h5 class="fw-bold">Abilities</h5>
            <ul class="list-group list-group-flush">
              <li
                class="list-group-item text-capitalize"
                v-for="ability in pokemon.abilities"
                :key="ability.ability.name"
              >
                {{ ability.ability.name }}
              </li>
            </ul>
          </div>
          <!-- Types -->
          <div class="mb-4">
            <h5 class="fw-bold">Types</h5>
            <div>
              <span
                v-for="type in pokemon.types"
                :key="type.type.name"
                class="badge me-1"
                :style="{ backgroundColor: getTypeColor(type.type.name), color: '#fff' }"
              >
                {{ type.type.name }}
              </span>
            </div>
          </div>
          <!-- Weight & Height -->
          <div>
            <h5 class="fw-bold">Weight & Height</h5>
            <p class="mb-0">Weight: {{ pokemon.weight }}</p>
            <p>Height: {{ pokemon.height }}</p>
          </div>

          <button @click="openEditModal" class="btn btn-primary mt-2 p-2">Edit Detail</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- Modal -->
  <div
    class="modal fade show d-block"
    tabindex="-1"
    v-if="showModal"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit {{ pokemon.name }}</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Height</label>
            <input v-model="edited.height" type="number" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Weight</label>
            <input v-model="edited.weight" type="number" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button class="btn btn-primary" @click="saveEdit">Save</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast container -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
    <div
      class="toast align-items-center text-white bg-success border-0"
      ref="successToast"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">Pokémon details updated successfully!</div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>

    <div
      class="toast align-items-center text-white bg-danger border-0"
      ref="errorToast"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">Failed to update Pokémon.</div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>
