import { h, Component } from 'preact'

import 'leaflet/dist/leaflet.css'
import { Map as LeafletMap, ZoomControl, GeoJSON, Pane, FeatureGroup, Tooltip } from 'react-leaflet'
import { BingLayer } from 'react-leaflet-bing'

import Markers from '@components/Markers'
import MapPolygonWithAbsolutePoints from '@shared/components/MapPolygonWithAbsolutePoints'
import Search from '@shared/components/Search'
import MapLocationMarker from '@shared/components/MapLocationMarker'
import { featureToLatLng } from '@shared/lib/geoJsonCompat'
import berlinMask from '@data/berlin.geo.json'
import planungsRaeume from '@data/planungsraeume.geo.json'
import colors from '@shared/styles/colors.sass'
import _ from './styles.sass'

// constants
const BING_KEY = 'AsDTwD6TitCJVtFu4xIeYWq1UQKJq2KMUrj7GpQzRpgt7JDtgMWiI8Ovzw_qkz7F'

export default class Map extends Component {
  handleSearch = (result) => {
    if (!result) {
      // search result was cleared
      this.context.actions.setSearchResult(undefined)
    } else {
      this.map.setView(result.location, 13) // zoom to hardcoded level
      this.context.actions.setSearchResult(result)
    }
  }

  handleZoom = (e) => {
    const map = e.target
    map.dragging.enable()
  }

  checkSize = () => {
    const width = this.map._container.clientWidth
    const height = this.map._container.clientHeight

    if (this.prevWidth !== width || this.prevHeight !== height) {
      this.prevWidth = width
      this.prevHeight = height
      this.map.invalidateSize(false)
    }
  }

  flyToSelectedMarker = () => {
    if (!this.map) return

    const marker = this.props.markers[this.props.selectedMarkerIndex]

    this.map.panTo(featureToLatLng(marker), {
      animate: true
    })
  }

  componentDidMount () {
    this.intervalId = setInterval(this.checkSize, 50)
  }

  componentDidUpdate (prevProps) {
    if (this.props.selectedMarkerIndex === prevProps.selectedMarkerIndex &&
        this.props.markers === prevProps.markers) return
    this.flyToSelectedMarker()
  }

  componentDidUnMount () {
    clearInterval(this.intervalId)
  }

  render (props) {
    const {
      markers,
      selectedMarkerIndex,
      isTouchEnabled,
      isOnSmallScreen,
      searchResult
    } = props

    const selectedMarker = markers[selectedMarkerIndex] || null

    // props used for initial map rendering
    const berlin = {
      center: { lat: 52.5244, lng: 13.4105 },
      bounds: {
        topleft: { lat: 52.69, lng: 13.06 },
        bottomright: { lat: 52.32, lng: 13.79 }
      },
      maxBounds: {
        topleft: { lat: 52.8, lng: 12.9 },
        bottomright: { lat: 52.2, lng: 13.9 }
      }
    }

    const mapProps = {
      animate: true,
      // this is false because ios jumps towards elemts that can have focus when you touch
      // them which makes the page jump
      keyboard: false,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      onZoom: this.handleZoom,
      zoomSnap: false,
      bounds: [
        [berlin.bounds.bottomright.lat, berlin.bounds.bottomright.lng],
        [berlin.bounds.topleft.lat, berlin.bounds.topleft.lng]
      ],
      maxBounds: [
        [berlin.maxBounds.bottomright.lat, berlin.maxBounds.bottomright.lng],
        [berlin.maxBounds.topleft.lat, berlin.maxBounds.topleft.lng]
      ]
    }

    const searchProps = {
      layers: ['address'],
      isOnSmallScreen: isOnSmallScreen,
      onSelect: result => this.handleSearch(result)
    }

    const maskProps = {
      interactive: false,
      fillOpacity: 0.8,
      color: 'white',
      stroke: false
    }

    const raeumeProps = {
      color: 'grey',
      weight: 0.4,
      style: (feature) => {
        let value = parseInt(feature.properties.einfache_wohnlage_proz)
        const threshold = 100 / 7
        const thresholdOpacity = 100 / 8 // to avoid having black non opaque areas
        switch (true) {
          // 0
          case (value === 0): 
            return {
              fillColor: 'white',
              fillOpacity: 0.6
            }
          // 1
          case (value <= threshold): 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity / 100
            }
          // 2
          case (value > threshold && value <= threshold * 2): 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity * 2 / 100
            }
          // 3
          case (value > threshold * 2 && value <= threshold * 3): 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity * 3 / 100
            }
          // 4
          case (value > threshold * 3 && value <= threshold * 4): 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity * 4 / 100
            }
          // 5
          case (value > threshold * 4 && value <= threshold * 5): 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity * 5 / 100
            }
          // 6
          case (value > threshold * 5 && value <= threshold * 6): 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity * 6 / 100
            }
          // 7 
          default: 
            return {
              fillColor: 'black',
              fillOpacity: thresholdOpacity * 7 / 100
            }
        }
      }
    }

    const polygonProps = selectedMarker ? {
      positionsOnMap: [{
        lat: selectedMarker.geometry.coordinates[1],
        lng: selectedMarker.geometry.coordinates[0]
      }],
      pointCalculationFunctions: [
        ({ width, height }) => ({ x: width * 0.8, y: -2 }),
        ({ width, height }) => ({ x: width * 0.8 + 10, y: -2 })
      ],
      fillOpacity: 1,
      fillColor: colors.darkGrey,
      color: colors.darkGrey,
      weight: 1
    } : {}

    const markersProps = {
      selectedMarkerIndex: selectedMarkerIndex,
      isTouchEnabled: isTouchEnabled,
      isOnSmallScreen: isOnSmallScreen,
      markers: markers
    }

    return (<div class={props.class}>
      <Search class={_.addressSearch} {...searchProps} />

      <LeafletMap className={_.map} {...mapProps} ref={(map) => { this.map = map.leafletElement }}>
        <BingLayer type='CanvasGray' bingkey={BING_KEY} culture='de-de' style='trs|lv:false;fc:EAEAEA_pp|lv:false;v:false_ar|v:false;lv:false_vg|v:true;fc:E4E4E4_wt|fc:AED1E4_rd|sc:d0d0d0;fc:e9e9e9_mr|sc:d3d3d3;fc:dddddd_hg|sc:d3d3d3;fc:e9e9e9_g|lc:EAEAEA' />

        {/* <GeoJSON onEachFeature={onEachFeature} data={planungsRaeume} {...raeumeProps} /> */}

        <FeatureGroup>
          {planungsRaeume.features.map((plaungsRaum, i) => 
            <div>
              <Tooltip key={i} sticky={true}>
                <div>
                  <p>Kiez: </p>
                  <p>Bezirk: </p>
                  <p>Einwohner (2016): {plaungsRaum.properties.einwohner_2016}</p>  
                  <p>Davon in einfacher Wohnlage (%): </p>  
                </div>
              </Tooltip>
              <GeoJSON data={plaungsRaum} {...raeumeProps} />
            </div>
          )}
        </FeatureGroup>


        <ZoomControl position='bottomright' />

        <Markers {...markersProps} />
        {/*  markerPane has zIndex: 600; selectedMarkerPane has: 640 and TooltipPane has: 650 */}
        <Pane name='linePane' style={{ zIndex: 620 }}>
          { selectedMarker && <MapPolygonWithAbsolutePoints {...polygonProps} /> }
        </Pane>
        <Pane name='locationMarkerPane' style={{ zIndex: 640 }} />
        {/* for some reason rendering this inside the pane is working we have to specify it as a parameter */}
        <MapLocationMarker position={searchResult && searchResult.location} pane='locationMarkerPane' />
      </LeafletMap>
    </div>)
  }
}
