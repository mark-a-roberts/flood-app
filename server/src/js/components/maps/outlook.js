'use strict'
// This file represents the 5 day outlook used on the national page.
// It uses the MapContainer
// TODO: needs refactoring into layers and styles
// ALSO need to fix the functionality, I don't think the tickets have been developed as of 31/01/2020
import { transform, transformExtent } from 'ol/proj'
import { View } from 'ol'
import { Style, Fill } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { GeoJSON } from 'ol/format'

const maps = window.flood.maps
const { getParameterByName, forEach } = window.flood.utils
const MapContainer = maps.MapContainer

function OutlookMap () {
  // Container element
  const elementId = 'map-outlook'
  const containerEl = document.getElementById(elementId)

  const center = transform(maps.center, 'EPSG:4326', 'EPSG:3857')

  // options = options || {}

  const road = maps.layers.road()

  const view = new View({
    zoom: 6,
    minZoom: 6,
    maxZoom: 7,
    center: center,
    extent: transformExtent([
      -13.930664,
      47.428087,
      8.920898,
      59.040555
    ], 'EPSG:4326', 'EPSG:3857')
  })

  const pattern = function () {
    const canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    canvas.width = 8 * dpr
    canvas.height = 8 * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, 8, 8)
    ctx.beginPath()
    ctx.lineCap = 'square'
    ctx.strokeStyle = '#ffbf47'
    ctx.lineWidth = 2
    ctx.moveTo(-2, 2)
    ctx.lineTo(2, -2)
    ctx.stroke()
    ctx.moveTo(-2, 10)
    ctx.lineTo(10, -2)
    ctx.stroke()
    ctx.moveTo(6, 10)
    ctx.lineTo(10, 6)
    ctx.stroke()
    ctx.restore()
    return ctx.createPattern(canvas, 'repeat')
  }

  function styleFeature (feature) {
    // const strokeColour = '#6f777b'
    // const strokeWidth = 2
    const zIndex = feature.get('z-index')
    const lineDash = [2, 3]
    let fillColour = pattern()
    if (feature.get('risk-level') === 2) {
      fillColour = '#ffbf47'
    } else if (feature.get('risk-level') === 3) {
      fillColour = '#F47738'
    } else if (feature.get('risk-level') === 4) {
      fillColour = '#df3034'
    }

    return new Style({
      fill: new Fill({ color: fillColour }),
      lineDash: lineDash,
      zIndex: zIndex
    })
  }

  const areasOfConcern = new VectorLayer({
    zIndex: 200,
    renderMode: 'hybrid',
    source: new VectorSource({
      format: new GeoJSON(),
      projection: 'EPSG:3857',
      url: '/api/outlook.geojson'
    }),
    style: styleFeature,
    opacity: 0.9
  })

  // MapContainer options
  const mapOptions = {
    keyTemplate: 'map-key-outlook.html',
    view: view,
    layers: [
      road,
      areasOfConcern
    ]
  }

  // Create MapContainer
  const container = new MapContainer(containerEl, mapOptions)
  const map = container.map

  // Add outlook day controls
  const outlookControl = document.createElement('div')
  outlookControl.className = 'map__outlook-control'
  outlookControl.innerHTML = '<div class="map__outlook-control__inner"></div>'
  window.flood.model.days.forEach(function (day) {
    const div = document.createElement('div')
    div.className = 'map__outlook-control__day'
    div.setAttribute('data-risk-level', day.level)
    const button = document.createElement('button')
    button.className = 'map__outlook-control__button'
    button.setAttribute('aria-selected', !!day.idx)
    button.setAttribute('data-day', day.idx)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const d = new Date(day.date)
    button.innerHTML = `
        ${days[d.getDay()] + ' ' + d.getDate()}
        <span class="map__outlook-control__icon map__outlook-control__icon--risk-level-${day.level}"></span>`
    button.addEventListener('click', function (e) {
      const day = +button.getAttribute('data-day')
      setDay(day)
    })
    div.appendChild(button)
    outlookControl.childNodes[0].appendChild(div)
  })
  container.mapElement.appendChild(outlookControl)

  // Outlook set day function
  function setDay (day) {
    areasOfConcern.getSource().forEachFeature(function (feature) {
      const featureDay = feature.get('day')
      const visible = featureDay === day
      feature.setStyle(visible ? null : new Style({}))
    })
    forEach(outlookControl.querySelectorAll('button'), function (btn, i) {
      btn.setAttribute('aria-selected', i + 1 === day ? 'true' : 'false')
    })
  }

  // Set day to first day with heightened risk
  const days = outlookControl.querySelectorAll('.map__outlook-control__day')
  for (let i = 0; i < days.length; i++) {
    const riskLevel = Number(days[i].getAttribute('data-risk-level'))
    if (riskLevel >= 1) {
      setDay(i + 1)
      break
    }
    setDay(1)
  }

  //
  // Events
  //

  // Precompose - setup view and features first
  map.once('precompose', function (e) {
    // Set map extent to intial extent
    const extent = getParameterByName('e') ? getParameterByName('e').split(',').map(Number) : maps.extent
    map.getView().fit(extent, { constrainResolution: false, padding: [0, 0, 0, 0] })
  })

  // Toggle fullscreen view on browser history change
  function popStateListener (e) {
    if (e && e.state && getParameterByName('v') === elementId) {
      window.removeEventListener('popstate', popStateListener)
      maps.createOutlookMap()
      window.flood.historyAdvanced = true
    } else {
      const el = document.getElementById(elementId)
      if (el.firstChild) {
        el.removeChild(el.firstChild)
      }
    }
  }
  window.addEventListener('popstate', popStateListener)
}

// Export a helper factory to create this map
// onto the `maps` object.
// (This is done mainly to avoid the rule
// "do not use 'new' for side effects. (no-new)")
maps.createOutlookMap = function () {
  return new OutlookMap()
}
