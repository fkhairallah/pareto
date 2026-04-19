<script lang="ts" setup>
import axios from "axios";
import { reactive, ref, onMounted, watch, computed } from "vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VTimePicker } from 'vuetify/components/VTimePicker'

const stationID = 8722718; // Ocean Ridge, FL
const MrsCayClearance = 0.5
const MIN_CHANNEL_DEPTH = 0.5 // feet (6 inches) — change this to adjust the passable threshold
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
    const endDate = new Date(startDate.value)
    endDate.setDate(startDate.value.getDate() + 6);
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

// For each of the 3 displayed days, compute the time windows when tide >= MIN_CHANNEL_DEPTH.
// Uses cosine interpolation between hi/lo points to find the exact crossing times.
const passWindows = computed(() => {
  if (!tides.data || tides.data.length < 2) return [];

  const crossings: { time: number; rising: boolean }[] = [];
  for (let i = 0; i < tides.data.length - 1; i++) {
    const t1 = new Date(tides.data[i].t).getTime();
    const v1 = parseFloat(tides.data[i].v);
    const t2 = new Date(tides.data[i + 1].t).getTime();
    const v2 = parseFloat(tides.data[i + 1].v);
    if (Math.min(v1, v2) < MIN_CHANNEL_DEPTH && Math.max(v1, v2) >= MIN_CHANNEL_DEPTH) {
      // Cosine interpolation: arg = (v1 + v2 - 2*th) / (v2 - v1)
      const arg = Math.max(-1, Math.min(1, (v1 + v2 - 2 * MIN_CHANNEL_DEPTH) / (v2 - v1)));
      crossings.push({ time: t1 + ((t2 - t1) / Math.PI) * Math.acos(arg), rising: v2 > v1 });
    }
  }

  const windows: { start: number; end: number }[] = [];
  let windowStart: number | null = parseFloat(tides.data[0].v) >= MIN_CHANNEL_DEPTH
    ? new Date(tides.data[0].t).getTime()
    : null;

  for (const c of crossings) {
    if (c.rising) {
      windowStart = c.time;
    } else if (windowStart !== null) {
      windows.push({ start: windowStart, end: c.time });
      windowStart = null;
    }
  }
  if (windowStart !== null) {
    windows.push({ start: windowStart, end: new Date(tides.data[tides.data.length - 1].t).getTime() });
  }

  const fmt = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(startDate.value);
    dayStart.setDate(startDate.value.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const dayWindows = windows
      .filter(w => w.start < dayEnd.getTime() && w.end > dayStart.getTime())
      .map(w => `${fmt(Math.max(w.start, dayStart.getTime()))} to ${fmt(Math.min(w.end, dayEnd.getTime()))}`);

    return {
      day: dayStart.toLocaleDateString('en-US', { weekday: 'long' }),
      date: dayStart.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      windows: dayWindows.length ? dayWindows : ['None'],
    };
  });
});



</script>
<template>

  <v-row>
    <v-col cols="12" class="pb-0">
      <!-- Current clearance status — most important, shown first -->
      <v-card :color="tideHeight < MrsCayClearance ? 'red-darken-1' : 'green-darken-1'">
        <v-card-title class="text-white">
          Channel: {{ tideHeight < MrsCayClearance ? 'CLOSED' : 'OPEN' }}
        </v-card-title>
        <v-card-subtitle class="text-white">
          Clearance: {{ convertToFeetAndInches(tideHeight.toString()) }}
          <span v-if="nextClearanceTime"> · {{ nextClearanceTime }}</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <!-- Pass windows by day -->
    <v-col cols="12" class="pt-1">
      <v-table class="elevation-1">

        <tbody>
          <tr v-for="row in passWindows" :key="row.day">
            <td>
              <span class="font-weight-bold">{{ row.day }}</span>
              <span class="text-caption text-medium-emphasis ml-1">{{ row.date }}</span>
            </td>
            <td>
              <div v-for="(w, idx) in row.windows" :key="idx" :style="{ color: w === 'None' ? 'red' : 'inherit' }">
                {{ w }}
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>

  <!-- Live camera -->
  <v-row class="mb-2">
    <v-col cols="12">
      <iframe src="https://video-monitoring.com/beachcams/boyntoninlet/mobile.htm?station=South%20View" width="100%"
        height="500px"></iframe>
    </v-col>
  </v-row>

  <!-- Hi/Lo tides table -->
  <v-row class="mb-2">
    <v-col cols="12">
      <v-expansion-panels>
        <v-expansion-panel title="Hi/Lo Tides">
          <v-expansion-panel-text>
            <v-card v-if="tides.loading">
              <v-card-text>
                Loading tides data...
                <v-progress-linear indeterminate color="primary"></v-progress-linear>
              </v-card-text>
            </v-card>
            <v-card v-else-if="tides.error">
              <v-card-title>Error</v-card-title>
              <v-card-text>{{ tides.error }}</v-card-text>
            </v-card>
            <v-data-table v-else :items="tides.data" :items-per-page="-1" hide-default-footer :headers="tideHeaders">
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
            <v-btn width="100%" href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8722718"
              target="_blank" color="primary" class="mt-2">
              NOAA Site
            </v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <!-- Date/time pickers to check clearance at a specific time -->
  <v-row class="mb-2">
    <v-col cols="12">
      <v-date-input v-model="startDate" label="Start Date"></v-date-input>
      <v-time-picker v-model="startTime" :allowed-minutes="allowedMinutes" ampm-in-title class="mt-2"></v-time-picker>
    </v-col>
  </v-row>


</template>