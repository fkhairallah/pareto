<template>
  <v-container fluid fill-height>
    <v-row class="text-center">
      <v-col cols="4">
        <v-card v-if="configMode">
          <v-card-title class="headline grey lighten-2">
            Configure Simulation
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-row class="pt-3">
                <v-text-field label="Initial Net Worth" prefix="$" v-model="sim.initialCapital" type="number"></v-text-field>
              </v-row>
              <v-row>
                <v-col>
                  <h2>Red Players</h2>
                  <v-text-field label="Number of Players" v-model="numberRedPlayers" value="10" type="number" ></v-text-field>
                  <v-combobox v-model="redFamily" :items="familyCodeList" dense solo></v-combobox>
                  <v-combobox v-model="redMotivation" :items="motivationCodeList" dense solo></v-combobox>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col>
                  <h2>Blue Players</h2>
                  <v-text-field
                    label="Number of Players"
                    v-model="numberBluePlayers"
                    value="10"
                    type="number"
                  ></v-text-field>
                  <v-combobox v-model="blueFamily" :items="familyCodeList" dense solo></v-combobox>
                  <v-combobox v-model="blueMotivation" :items="motivationCodeList" dense  solo></v-combobox>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn dark color="primary" @click="configureSimulation">Run Simulation</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else>
          <v-card-title class="headline grey lighten-2">
            Paredo Simulation
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-slider hint="Adjust the speed of the simulation: # transactions between updates" thumb-label  max="500"  min="40" label="Speed" v-model="simulationSpeed"></v-slider>
              <v-row>
                <v-switch v-model="sim.taxTheRich" inset label="Tax the Rich" />
                <v-spacer></v-spacer>
                <v-text-field append-icon="%" v-model="sim.richTaxPercentage" type="number" class="shrink"></v-text-field>
              </v-row>
              <v-row>
                <v-switch v-model="sim.giveWelfare"   inset label="Give enough welfare to lift above powerty line"/>
                <v-spacer></v-spacer>
                <!-- <v-text-field append-icon="%" v-model="sim.welfarePercentage" type="number" class="shrink"></v-text-field> -->
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn v-if="runFlag" dark color="primary" @click="pauseSimulation"> Pause </v-btn>
            <v-btn v-else dark color="primary" @click="startSimulation"> Start </v-btn>
            <v-spacer></v-spacer>
            <v-btn dark @click="cancelSimulation"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col>
        <h3>{{legend}}</h3>
        <p>{{ sim.stat() }}</p>
        <line-chart
          ref="simChart"
          :chart-data="dataCollection"
          :options="options"
        ></line-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LineChart from "./BarChart";
import Pareto from "../model/pareto";
import Player from '@/model/Player';

const pSim = new Pareto(20, 20);
var simInterval = 0;

export default {
  name: "Chart",
  components: {
    LineChart,
  },
  data() {
    return {

      // data used in configuration vCard data collection
      //initialCapital: 20, // initial capital to start
      numberRedPlayers: 10, // # of red players
      numberBluePlayers: 10, // # of red players
      redFamily: {text: "", value: 1},
      redMotivation:  {text: "", value: 0},
      blueFamily: {text: "", value: 1},
      blueMotivation:  {text: "", value: 0},


      motivationCodeList: [
        {
          text: "Average",
          value: 0,
        },
        {
          text: "Make Bad Choices",
          value: -1,
        },
        {
          text: "Motivated",
          value: 1,
        },
      ],
      familyCodeList: [
        {
          text: "Middle Class",
          value: 1,
        },
        {
          text: "Rich Dad",
          value: 2,
        },
        {
          text: "Poor Dad",
          value: 0.5,
        },
      ],

      configMode: true, // is the simulation in run or config mode
      runFlag: false,
      simulationSpeed: 50,  // speed of simulation

      // pareto simulation initial configuration
      sim: pSim,
      legend: "Pareto Principle Simulation",

      // Chart initial configuration
      dataCollection: {
        labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,],
        datasets: [
          {
            label: "Net Worth",
            backgroundColor: ["#f87979","#f87979","#f87979","#f87979","#f87979","#f87979","#f87979","#f87979","#f87979","#f87979", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0", "#4eb9f0"],
            data: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          display: true,
           yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
        },
        legend: {
          display: false,
        },
        animation: {
          duration: 200,
        },
      },
    };
  },
  computed: {},
  mounted() {

  },
  deactivated() {
    console.log("deactivated");
  },
  beforeUnmount: function () {
    console.log("befoneUnmount");
  },
  methods: {
    configureSimulation() {
      pSim.configureSimulation(this.initialCapital);
      var redPlayer = new Player();
      redPlayer.name = "Red";
      redPlayer.color = '#FF0000';
      console.log("red",this.redFamily, this.redMotivation)
      redPlayer.silverSpoonRatio = this.redFamily.value;
      redPlayer.motivationFactor = this.redMotivation.value;
      pSim.configurePlayers(this.numberRedPlayers,redPlayer); // Red Players

      var bluePlayer = new Player();
      bluePlayer.name = "Blue";
      bluePlayer.color = '#0000FF';
      bluePlayer.silverSpoonRatio = this.blueFamily.value;
      bluePlayer.motivationFactor = this.blueMotivation.value;
      pSim.configurePlayers(this.numberBluePlayers,bluePlayer); // Blue Players
      console.log(pSim.players);

      this.legend = `Red Players ${this.redMotivation.text} from ${this.redFamily.text}, Blue Players ${this.blueMotivation.text} from ${this.blueFamily.text}`

      for (var i = 0; i < pSim.players.length; i++) {
          this.dataCollection.datasets[0].data[i] = pSim.players[i].netWorth;
          this.dataCollection.datasets[0].backgroundColor[i] = pSim.players[i].color;
          this.dataCollection.labels[i] = `P${i+1}`
      }
      this.$refs.simChart.refresh();
      this.configMode = false;
      console.log(pSim.players.length," Players")
  
    },

    // cancel the simulation and return to config mode
    cancelSimulation() {
      this.configMode = true;
      this.runFlag = false;
      console.log("Stop!")
      if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
      }
    },

    // start or restart the simulation. If the run is complete. it stops
    startSimulation() {
      this.runFlag = true;
       simInterval = setInterval(() => {
          pSim.run(this.simulationSpeed);
          for (var i = 0; i < pSim.players.length; i++) {
            this.dataCollection.datasets[0].data[i] = pSim.players[i].netWorth;
            this.dataCollection.datasets[0].backgroundColor[i] = pSim.players[i].color;
          }
          this.$refs.simChart.refresh();

          if (pSim.finished) {
            console.log("Simulation Done");
            clearInterval(simInterval);
            this.runFlag = false;
          }

        }, 1000);
    },

    // pause the simulation for discussion point
    pauseSimulation() {
      this.runFlag = false;
      console.log("Pause!")
      if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
      }
    },

  },
};
</script>
