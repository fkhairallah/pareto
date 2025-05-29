<script setup lang="ts">
import { ref } from 'vue';
import Chart from './components/chart.vue'
import TidesInOceanRidge from './components/TidesInOceanRidge.vue'

const paretoMode = ref(false)
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>

      <span class="mx-5">{{ (paretoMode? "Pareto Principle Simulation":"Tides In Ocean Ridge")}}</span>
      <v-spacer></v-spacer>
      <v-btn v-if="paretoMode" flat href="https://en.wikipedia.org/wiki/Pareto_principle" target="_blank">
        <span class="mr-2">Background Info</span>
      </v-btn>
      <v-switch v-model="paretoMode" label="Pareto Mode" color="white" hide-details inset density="compact"
        class="mr-5"></v-switch>

    </v-app-bar>

    <v-main>
      <TidesInOceanRidge v-if="!paretoMode" />
      <Chart v-else />
    </v-main>
  </v-app>
</template>

