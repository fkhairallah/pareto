<template>
  <v-container fluid fill-height>
    <v-row class="text-center">
      <v-col cols="12">
        <v-card v-if="configMode">
          <v-card-title class="headline grey lighten-2">
            Configure Simulation
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-row class="pt-3">
                <v-text-field label="Initial Net Worth" prefix="$" v-model="sim.initialCapital"
                  type="number"></v-text-field>
              </v-row>
              <v-row>
                <v-col>
                  <h2>Red Players</h2>
                  <v-text-field label="Number of Players" v-model="numberRedPlayers" type="number"></v-text-field>
                  <v-combobox v-model="redFamily" :items="familyCodeList" item-title="text" item-value="value"
                    :return-object="false" dense solo></v-combobox>
                  <v-combobox v-model="redMotivation" :items="motivationCodeList" item-title="text" item-value="value"
                    :return-object="false" dense solo></v-combobox>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col>
                  <h2>Blue Players</h2>
                  <v-text-field label="Number of Players" v-model="numberBluePlayers" type="number"></v-text-field>
                  <v-combobox v-model="blueFamily" :items="familyCodeList" item-title="text" item-value="value"
                    :return-object="false" dense solo></v-combobox>
                  <v-combobox v-model="blueMotivation" :items="motivationCodeList" item-title="text" item-value="value"
                    :return-object="false" dense solo></v-combobox>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="configureSimulation">Run Simulation</v-btn>
            <v-spacer></v-spacer>
            <v-btn flat href="https://en.wikipedia.org/wiki/Pareto_principle" target="_blank">
              <span class="mr-2">Background Info</span>
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else>
          <v-card-title class="headline grey lighten-2">
            Paredo Simulation
          </v-card-title>
          <v-card-actions>
            <v-btn v-if="runFlag" color="primary" @click="pauseSimulation">Pause</v-btn>
            <v-btn v-else color="primary" @click="startSimulation">Start</v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="cancelSimulation">Cancel</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-text>
            <v-form>
              <v-slider hint="Adjust the speed of the simulation" thumb-label max="500" min="40" label="Speed"
                v-model="simulationSpeed"></v-slider>
              <v-row>
                <v-switch v-model="sim.taxTheRich" label="Tax the Wealthy" />
                <v-spacer></v-spacer>
                <v-text-field append-icon="%" v-model="sim.richTaxPercentage" type="number"
                  class="shortTextField"></v-text-field>
              </v-row>
              <v-row>
                <v-switch v-model="sim.giveWelfare" label="Give Welfare" />
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="text-center">
      <v-col cols="12" class="pa-0">
        <v-divider></v-divider>
        <canvas id="myChart"  style="width:100%; height:400"></canvas>         
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, onMounted} from 'vue'
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js'
// import { Bar } from 'vue-chartjs';
import Pareto from "../model/pareto"
import Player from "@/model/Player"

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)


// Initialize Pareto simulation
const pSim = new Pareto()
let simInterval:any | null = null;


// State
const configMode = ref(true)
const runFlag = ref(false)
const simulationSpeed = ref(50)
const numberRedPlayers = ref(10)
const numberBluePlayers = ref(10)

// Reactive state
const redFamily = ref(1)
const redMotivation = ref(0)
const blueFamily = ref(1)
const blueMotivation = ref(0)
const sim = reactive(pSim)

// Constants
const motivationCodeList = [
  { text: "Average", value: 0 },
  { text: "Make Bad Choices", value: -1 },
  { text: "Motivated", value: 1 }
]

const familyCodeList = [
  { text: "Middle Class", value: 1 },
  { text: "Rich Dad", value: 2 },
  { text: "Poor Dad", value: 0.5 }
]

// Chart data
const dataCollection = {
  labels: Array.from({ length: 20 }, (_, i) => `P${i + 1}`),
  datasets: [{
    label: "Net Worth",
    backgroundColor: Array(20).fill("#f87979"),
    data: Array.from({ length: 20 }, (_, i) => i + 1)
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {

  },
  plugins: {
    legend: {
      display: false
    }
  },
  animation: {
    duration: 200
  }
}

let myChart:any = null;

// onMounted(() => {
//   const ctx = document.getElementById('myChart');
//   myChart = new ChartJS(document.getElementById('myChart'),  {
//     type: "bar",
//     data: dataCollection,
//     options: chartOptions
//   });

//  myChart.update();

// });

// Methods
const configureSimulation = () => {
  configMode.value = false
  pSim.configureSimulation(sim.initialCapital)

  const redPlayer = new Player()
  redPlayer.name = "Red"
  redPlayer.color = "#FF0000"
  redPlayer.silverSpoonRatio = redFamily.value
  redPlayer.motivationFactor = redMotivation.value
  pSim.configurePlayers(numberRedPlayers.value, redPlayer)

  const bluePlayer = new Player()
  bluePlayer.name = "Blue"
  bluePlayer.color = "#0000FF"
  bluePlayer.silverSpoonRatio = blueFamily.value
  bluePlayer.motivationFactor = blueMotivation.value
  pSim.configurePlayers(numberBluePlayers.value, bluePlayer)

  if (myChart) {
    myChart.destroy()
  }


  myChart = new ChartJS(document.getElementById('myChart'), {
    type: "bar",
    data: dataCollection,
    options: chartOptions
  });


  pSim.players.forEach((player, i) => {

    // Initialize chart data with player net worth
    myChart.data.datasets[0].data[i] = player.netWorth
    // set player color
    myChart.data.datasets[0].backgroundColor[i] = player.color
    // set player label
    myChart.data.labels[i] = player.name
  });
  myChart.update();

}

const updateChartData = () => {
  pSim.players.forEach((player, i) => {
    myChart.data.datasets[0].data[i] = player.netWorth
  });
  myChart.update();
}

const cancelSimulation = () => {
  configMode.value = true
  runFlag.value = false
  if (simInterval) {
    clearInterval(simInterval)
    console.log("Simulation stopped.");
    simInterval = 0
    configMode.value = true;
    configMode.value = false;
  }
}

const startSimulation = () => {
  runFlag.value = true
  simInterval = setInterval(() => {
    pSim.run(simulationSpeed.value)
    updateChartData()

    if (pSim.finished) {
      clearInterval(simInterval)
      runFlag.value = false
    }
  }, 1000)
}

const pauseSimulation = () => {
  runFlag.value = false
  if (simInterval) {
    clearInterval(simInterval)
  }
}

// Lifecycle hooks
onBeforeUnmount(() => {
  if (simInterval) {
    clearInterval(simInterval)
  }
})
</script>

<style scoped>
.shortTextField {
  width: 60px;
}
</style>