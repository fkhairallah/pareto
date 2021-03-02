<template>
  <v-container fluid fill-height>
    <v-row class="text-center">
      <v-col cols="4">
        <v-switch v-model="runFlag" @click="runSim" inset label="Run Simulation" />
        <v-switch v-model="silverSpoonFlag" inset label="Silver Spoon" />
        <v-switch v-model="sim.taxTheRich" inset label="Tax the Rich" />
        <v-switch v-model="sim.giveWelfare" inset label="Distribute welfate to the poor" />
        <v-switch v-model="sim.increaseMotivation" inset label="Work Hard!" />
      </v-col>
      <v-col>
        <p>{{sim.stat()}}</p>
        <line-chart ref="simChart"
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

const pSim = new Pareto(20,20);
var simInterval=0;

export default {
  name: "Chart",
  components: {
    LineChart,
  },
  data() {
    return {
      runFlag: false,
      silverSpoonFlag: false,
      sim: pSim,
      psimStat: "",
      dataCollection: {
        labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        datasets: [
          {
            label: "Net Worth",
            backgroundColor: ["#f87979"],
            data: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          display: true,
        },
        legend: {
          display: false
        },
        animation: {
          duration: 200,
        }
      },
    };
  },
  computed: {
      
  },
  mounted() {
    //this.fillData();
    //pSim.run(20);
    //console.log("Psim=",pSim.stat())
  },
  deactivated() {
    console.log("deactivated");
  },
  beforeUnmount: function () {
    console.log("befoneUnmount");
  },
  methods: {
     
    runSim() {
      console.log("@click", this.runFlag);
      if (this.silverSpoonFlag) pSim.abSilverSpoon(2);
      if (this.runFlag) {
        console.log("Sim on");
        simInterval = setInterval(() => {
          pSim.run(pSim.initialCapital*3);
          for (var i=0;i<pSim.currentNetWorth.length;i++){
            this.dataCollection.datasets[0].data[i] = pSim.currentNetWorth[i];
            if (pSim.isPoor(i)) this.dataCollection.datasets[0].backgroundColor[i] = "#f80000";
            if (pSim.isLowerMiddleClass(i)) this.dataCollection.datasets[0].backgroundColor[i] = "#f800f8";
            if (pSim.isMiddleClass(i)) this.dataCollection.datasets[0].backgroundColor[i] = "#0000dd";
            if (pSim.isUpperClass(i)) this.dataCollection.datasets[0].backgroundColor[i] = "#00dd00";

          }
          //this.psimStat = pSim.stat();
          console.log(this.dataCollection.datasets[0].data);
          this.$refs.simChart.refresh();          
        }, 1000);
      } else {
        console.log("Sim OFF");
        if (simInterval) clearInterval(simInterval);
      }

    },
  
  },
};
</script>
