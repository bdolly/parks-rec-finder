<template>
 <div class="pprf-map__container">
    <v-map ref="leafletMap" id="PPRF-Leaflet-Map" :options="mapOptions" :zoom="zoom" :center="center" >

      <v-tilelayer :url="basemap" ></v-tilelayer>
      <v-tilelayer :url="streets" ></v-tilelayer>

      <v-svg-marker
        v-if="userLocation"
        :latLng="userLocation"
        :options="userPinOptions"
      >
        <v-popup content="You are here" />
      </v-svg-marker>

      <v-svg-marker
          v-for="marker in markers"
          @l-click="onMarkerClick(marker)"
          :key="marker.id"
          :latLng="[marker.lat, marker.lng]"
          :options="{iconOptions:{color: marker.color, opacity: marker.opacity, iconSize: marker.size, fillOpacity: marker.opacity, circleFillOpacity: marker.opacity, circleOpacity: marker.opacity}}"
      >
        <v-popup :content="marker.content()" />
      </v-svg-marker>
    </v-map>
    <div v-show="loading" class="loading-overlay"></div>
 </div>
</template>

<script>
import L from 'leaflet'
import Vue2Leaflet from 'vue2-leaflet'
import {mapState} from 'vuex'
import {EventBus} from '@/event-bus'
import EsriTileLayer from '@/components/map/EsriTileLayer'
import CircleMarker from '@/components/map/CircleMarker'
import SVGMarker from '@/components/map/SVGMarker'

/**
 * Leaflet.js MAP component
 *
 * Map implementatation using City of Philadelphia's ESRI base map layers. This
 * component uses the git sub-moduled version of Vue2Leaflet as a simple Vue wrapper
 * for Leaflet.js
 *
 * 0.1.0
 */
export default {

  name: 'PPRF-Leaflet-Map-Container',

  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer': EsriTileLayer,
    'v-popup': Vue2Leaflet.Popup,
    'v-svg-marker': SVGMarker,
    'v-circle-marker': CircleMarker
  },

  mounted () {
    // get the users current location
    // and drop a pin
    navigator.geolocation.getCurrentPosition(position => {
      this.userLocation = L.latLng(position.coords.latitude, position.coords.longitude)
    })
  },

  updated () {
    this.fitToMarkerBounds()
  },

  data () {
    return {
      zoom: 14,
      mapOptions: {
        zoomControl: {
          position: 'bottomright'
        }
      },
      center: [39.9523893, -75.1636291],
      basemap: process.env.ESRI.tiledLayers.basemap,
      streets: process.env.ESRI.tiledLayers.streets,
      userLocation: null,
      userPinOptions: {
        iconOptions: {
          fillOpacity: 1,
          color: 'rgb(204,48,0)'
        }
      }
    }
  },

  computed: {
    ...mapState({
      markers: state => state.mapMarkers,
      zipcodeSearched: state => state.search.fields.zip,
      loading: state => state.loading,
      mobileOpen: state => !state.mobile.listView,
      modals: state => state.modals
    }),
    activeEntity () {
      let entityTypeParam = this.$store.state.route.params.entityType
      if (entityTypeParam) {
        return entityTypeParam === 'locations'
        ? 'facility'
        : 'program'
      }
      return this.$store.state.activeTab
    }
  },

  methods: {
    /**
     * Zoom the map the bounds of all the markers
     * @return {void}
     *
     * @public
     * @since 0.1.1
     */
    fitToMarkerBounds () {
      let _markers = this.markers
      // @TODO: don't add zipcode zoom until polygons are added
      // if (this.zipcodeSearched) {
      //   _markers = this.markers.filter(marker => marker.within_zip_code)
      // }
      if (_markers && _markers.length) {
        let markersLatLng = _markers.map(marker => L.latLng(marker.lat, marker.lng))
        /* eslint-disable new-cap */
        let {_southWest, _northEast} = L.latLngBounds(markersLatLng)
        this.$refs.leafletMap.fitBounds([[_southWest.lat, _southWest.lng], [_northEast.lat, _northEast.lng]])
      }
    },
    /**
     * on marker click emit a global event
     * @param  {object} marker dervied marker object from store/modules/markers/Marker.js
     * @return {void}
     *
     * @public
     * @since 0.3.9
     */
    onMarkerClick (marker) {
      EventBus.$emit('map:markerClick', marker)
    }
  }
}
</script>

<style lang="scss" >
  .loading-overlay{
    position:absolute;
    display:block;
    top:0;
    left:0;
    width:100%;
    height:calc(#{$max-app-height} - #{$header-height} - #{$footer-height});
    background: rgba(0,0,0,.85);
    z-index: 100000;
    pointer-events: none;
  }
  .pprf-map__container{
    flex:1;
    width: 100%;
    position:relative;
    display: block;
    height:calc(#{$max-app-height} - #{$header-height} - #{$footer-height} + 20px);
  }
  .pprf-map__container.pprf-map__container--mobile{
    display: none;
  }

  .leaflet-control-zoom{
    //position: fixed;
    //bottom: 60px;
    //right: 20px;
    z-index: 1;
    border: 3px solid #444 !important;
    color: color(ben-franklin-blue) !important;
    border-radius: 0px !important;
    * { border-radius: 0px !important; }
  }
  .leaflet-popup {
    .leaflet-popup-content-wrapper {
      border-radius: $border-radius;
      h3{
        font:{
          family: $font-montserrat;
          weight: 700;
        };
        color: color(dark-ben-franklin);
      }
    }
  }

@include breakpoint (medium down) {
  .loading-overlay{
    position:fixed;
    height:calc(#{$max-app-height} - #{$header-height-mobile});
    top: $header-height-mobile;
  }
  .pprf-map__container{
    display: none;
  }
  // filters open
  .pprf-app--mobile-filters-open {
    .loading-overlay,
    .pprf-map__container.pprf-map__container--mobile{
      display: none;
    }
  }

 .pprf-sidebar .pprf-map__container.pprf-map__container--mobile{
    flex:.999;
    height: auto;
    position: relative;
    top:auto;
  }
.pprf-sidebar .pprf-map__container.pprf-map__container--open-mobile{
    display: block;
  }
}
</style>
