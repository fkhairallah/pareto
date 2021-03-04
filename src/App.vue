<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
     
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />



        <span class="mr-2">Pareto Principle Simulation</span>
         <v-spacer></v-spacer>
         <v-btn
        flat
        href="https://en.wikipedia.org/wiki/Pareto_principle"
        target="_blank"
      >
        <span class="mr-2">Background</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Chart />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
//import Sim from './components/sim.vue';
import Chart from './components/chart.vue';



export default Vue.extend({
  name: 'App',

  components: {
  //  Sim,
    Chart,
  },

  data: () => ({
    //
  }),
});
</script>
