# pareto
This page run a simulation to show how Pareto Principle works in a closed economic environment.

This was developed as a way for me to learn Vue.js and Veutify. (Both V2).

This projects also has CapacitorJS (V3.0.1) installed to generate Android APK.

Currently deployed on RyeManorPi OpenHab installation at http://ryemanorpi:8080/static/dist/index.html



## v1.1.0
- Fixed `VTimePicker` import — moved from `vuetify/labs` to `vuetify/components` (Vuetify 3.6+)
- Expanded tides data fetch from 3 days to 7 days
- Added **Pass Windows** table showing the daily time ranges when the channel tide is at or above 6" (0.5 ft), calculated via cosine interpolation between hi/lo tide points. Threshold is controlled by the `MIN_CHANNEL_DEPTH` constant in `TidesInOceanRidge.vue`
- Restructured page layout for mobile-first: clearance status card at top, pass windows below, live camera, then hi/lo tides table, then date/time pickers
- Moved hi/lo tides table into a collapsible expansion panel (closed by default)
- Clearance card is now color-coded green/red for open/closed channel status

## Project setup
use npm to install all the needed packages:
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize Simulations
Which economic model works best? Try your hand at socialism by implementing a progressive tax scheme. Or stick with capitalism that rewards hard work and persistence.
