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



        <span class="mr-2">Pareto Distribution Simulation</span>
         <v-spacer></v-spacer>
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
