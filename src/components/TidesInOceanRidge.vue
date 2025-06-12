<script lang="ts" setup>
import axios from "axios";
import { reactive, ref, onMounted, watch } from "vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

const stationID = 8722718; // Ocean Ridge, FL
const MrsCayClearance = 0.5
// Interface for NOAA tide prediction data
interface TidePrediction {
  t: string; // Date and time string (e.g., "2023-09-04 10:00")
  v: string; // Tide height value as a string (e.g., "2.5")
  type: string; // Type of tide (e.g., "H", "L", "P")
}
const tideHeaders = [
  { title: 'Time', key: 't' },
  { title: 'Height', key: 'v' },
  { title: 'Type', key: 'type' },
  
]
const startDate = ref(new Date());
const startTime = ref();
const tideHeight = ref(0);
const nextClearanceTime = ref('');

const tides = reactive({
  data: [] as TidePrediction[],
  loading: true,
  error: null as unknown,
});
const tidesHeight = reactive({
  data: [] as TidePrediction[],
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
    
    // Determine next tide clearance message based on current tide height
    if (tideHeight.value > MrsCayClearance) {
      const next = tidesHeight.data.find(t => new Date(t.t).getTime() > dateWithTime.getTime() && parseFloat(t.v) < MrsCayClearance);
      nextClearanceTime.value = next
        ? `Blocked at ${new Date(next.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '';
    } else {
      const next = tidesHeight.data.find(t => new Date(t.t).getTime() > dateWithTime.getTime() && parseFloat(t.v) >= MrsCayClearance);
      nextClearanceTime.value = next
        ? `Open at ${new Date(next.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '';
    }
  }

});


// take a date object and return a string formatted for NOAA like so: 20230904
function formatDate(date: Date): string {
  var y = date.getFullYear().toString();
  var d = date.getDate().toString();
  if (d.length == 1) d = '0' + d;
  var m = (date.getMonth() + 1).toString();
  if (m.length == 1) m = '0' + m;
  return (y + m + d)
}

  // take a float string and return ft/inches 3'6"
  function convertToFeetAndInches(feetString:string):string {
      const feet = parseFloat(feetString);
      if (isNaN(feet)) return "Invalid input";

      const totalInches = Math.abs(feet * 12); 
      const wholeFeet = Math.floor(Math.abs(feet)); 
      const inches = Math.round(totalInches % 12);

      return inches === 0 
          ? `${feet < 0 ? '-' : ''}${wholeFeet} ft` 
          : `${feet < 0 ? '-' : ''}${wholeFeet !== 0 ? wholeFeet + "'" : ''} ${inches}"`;
  }
// function to check if the time is allowed (every 5 minutes)
function allowedMinutes(time: number): boolean {
  return time % 5 === 0;
}



</script>
<template>

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


      <v-data-table v-else :items="tides.data" :items-per-page="-1" hide-default-footer :headers="tideHeaders"
        class="elevation-1">
        <template #item.t="{ item }">
          {{ new Date(item.t).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' }) }}
        </template>
        <template #item.v="{ item }">
          <div style="text-align: right">
            <span :style="{ color: parseFloat(item.v) < MrsCayClearance ? 'red' : 'inherit' }">
              {{ convertToFeetAndInches(item.v) }}
            </span>
          </div>
        </template>
      </v-data-table>
      <v-btn width="100%" href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8722718" target="_blank"
        color="primary">
        NOAA Site
      </v-btn>
    </v-col>
  </v-row>
  <v-row class="ma-5">

    <v-col cols="12" md="6">
      <v-date-input v-model="startDate" label="Start Date" max-width="368"></v-date-input>
      <v-time-picker v-model="startTime" :allowed-minutes="allowedMinutes" max-width="368" ampm-in-title></v-time-picker>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title :style="{ color: tideHeight < MrsCayClearance ? 'red' : 'green' }">Clearance: {{ convertToFeetAndInches(tideHeight.toString()) }}</v-card-title>
        <v-card-subtitle>
          {{ nextClearanceTime }}
        </v-card-subtitle>
      </v-card>
    </v-col>

  </v-row>

  <v-row>
    <v-col cols="12">
      <iframe src="https://video-monitoring.com/beachcams/boyntoninlet/mobile.htm?station=South%20View" width="100%"
        height="500px"></iframe>
    </v-col>
  </v-row>

</template>