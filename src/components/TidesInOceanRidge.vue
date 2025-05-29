<script lang="ts" setup>
import axios from "axios";
import { reactive, ref, onMounted, watch } from "vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

const stationID = 8722718; // Ocean Ridge, FL
const MrsCayClearance = 0.5


const startDate = ref(new Date());
const startTime = ref();
const tideHeight = ref(0);

const tides = reactive({
  data: [],
  loading: true,
  error: null as unknown,
});
const tidesHeight = reactive({
  data: [],
  loading: true,
  error: null as unknown,
});


// load today's tides data when the component is mounted
onMounted(async () => {
  await loadTidesData();
  startTime.value = startDate.value.getHours().toString().padStart(2, '0') + ':' + startDate.value.getMinutes().toString().padStart(2, '0');

});


// Function to load HI/LO tides data for 3 days from NOAA API
async function loadTidesData() {
  try {
  tides.loading = true;
  tides.error = null;
    const endDate = new Date()
    endDate.setDate(startDate.value.getDate() + 2); // Get tides for today and tomorrow
    const response = await axios.get(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?&begin_date=${formatDate(startDate.value)}&end_date=${formatDate(endDate)}&station=${stationID}&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&application=noaa&format=json&interval=hilo`
    );
    tides.data = response.data.predictions;
    console.log("Tides data:", tides.data);
    tidesHeight.loading = true;
  } catch (error) {
    tides.error = error;
  } finally {
    tides.loading = false;
  }
}

// watch for changes in startDate and load tides data accordingly
watch(startDate, async (newDate) => {
  if (newDate) {
    console.log("Selected date:", newDate);
    await loadTidesData();
  }
});

// watch for changes in startTime and update tideHeight accordingly
watch(startTime, async (newTime) => {
  if (newTime) {
    const [hours, minutes] = newTime.split(':').map(Number);
    const dateWithTime = new Date(startDate.value);
    dateWithTime.setHours(hours, minutes, 0, 0);

    // You can add logic here to handle the selected time if needed
    const response = await axios.get(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?&begin_date=${formatDate(startDate.value)}&end_date=${formatDate(startDate.value)}&station=${stationID}&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&application=noaa&format=json`
    );
    tidesHeight.data = response.data.predictions;
    tidesHeight.loading = false;
    tidesHeight.error = null;

    const td = tidesHeight.data.find(t => new Date(t.t).getTime() > dateWithTime.getTime());
    tideHeight.value = td ? parseFloat(td.v) : 0;
  }
});


// take a date object and return a string formatted for NOAA like so: 20230904
function formatDate(date: Date): string {
    var y = date.getFullYear().toString();
    var d = date.getDate().toString();
    if (d.length == 1) d = '0'+d;
    var m = (date.getMonth() + 1).toString();
    if (m.length == 1) m = '0'+m;
    return (y+m+d)
}

// function to check if the time is allowed (every 5 minutes)
function allowedMinutes(time: number):  boolean {
  return time % 5 === 0;
}



</script>
<template>


<v-row class="mb-4 ma-5">

  <v-col cols="12" md="6">  
  
    <v-date-input
      v-model="startDate"
      label="Start Date" 
      max-width="368"
    ></v-date-input>
    <v-time-picker
      v-model="startTime"
      :allowed-minutes="allowedMinutes"
      

    ></v-time-picker>
  </v-col>
  <v-col cols="12" md="6">
    <v-card>
      <v-card-title :style="{ color: tideHeight < MrsCayClearance ? 'red' : 'green' }">Clearance: {{ tideHeight }} ft.</v-card-title>
    </v-card>
  </v-col>

</v-row>
<v-row class="mb-4">
  <v-col cols="12" md="6">
  


    <v-card v-if="tides.loading">
      <v-card-text>
        Loading tides data...
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card-text>
    </v-card>
    
    <v-card v-else-if="tides.error">
      <v-card-title>Error</v-card-title>
      <v-card-text>
        {{ tides.error }}
      </v-card-text>
    </v-card>

    <v-data-table v-else :items="tides.data" :items-per-page="-1" hide-default-footer>
      <template #item.t="{ item }">
        {{ new Date(item.t).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' }) }}
      </template>
      <template #item.v="{ item }">
        <span :style="{ color: parseFloat(item.v) < MrsCayClearance ? 'red' : 'inherit' }">{{ item.v }} ft</span>
      </template>
    </v-data-table>
  </v-col>
</v-row>

</template>