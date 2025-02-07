'use strict'
/*
Sets up the window.flood.maps styles objects
*/
import { Style, Icon, Fill, Stroke, Text, Circle } from 'ol/style'

window.flood.maps.styles = {

  //
  // Vector styles live
  //

  targetAreaPolygons: (feature) => {
    // Use corresposnding warning feature propeties for styling
    const warningsSource = window.flood.maps.warningsSource
    let warningId = feature.getId()
    if (warningId.includes('flood_warning_alert')) {
      // Transform id if vector source
      warningId = 'flood' + feature.getId().substring(feature.getId().indexOf('.'))
    } else {
      // Transform id if vector tile source
      warningId = 'flood.' + feature.getId()
    }
    const warning = warningsSource.getFeatureById(warningId)
    if (!warning || warning.get('isVisible') !== 'true') { return new Style() }
    const severity = warning.get('severity_value')
    const isSelected = warning.get('isSelected')
    const isGroundwater = warning.getId().substring(6, 9) === 'FAG'

    // Defaults
    let strokeColour = 'transparent'
    let fillColour = 'transparent'
    let zIndex = 1

    switch (severity) {
      case 3: // Severe warning
        strokeColour = '#D4351C'
        fillColour = targetAreaPolygonPattern('severe')
        zIndex = 11
        break
      case 2: // Warning
        strokeColour = '#D4351C'
        fillColour = targetAreaPolygonPattern('warning')
        zIndex = 10
        break
      case 1: // Alert
        strokeColour = '#F47738'
        fillColour = targetAreaPolygonPattern('alert')
        zIndex = isGroundwater ? 4 : 7
        break
      default: // Removed or inactive
        strokeColour = '#626A6E'
        fillColour = targetAreaPolygonPattern('removed')
        zIndex = 1
    }
    zIndex = isSelected ? zIndex + 2 : zIndex

    const selectedStroke = new Style({ stroke: new Stroke({ color: '#FFDD00', width: 16 }), zIndex: zIndex })
    const stroke = new Style({ stroke: new Stroke({ color: strokeColour, width: 2 }), zIndex: zIndex })
    const fill = new Style({ fill: new Fill({ color: fillColour }), zIndex: zIndex })

    return isSelected ? [selectedStroke, stroke, fill] : [stroke, fill]
  },

  warnings: (feature, resolution) => {
    // Hide warning symbols or hide when polygon is shown
    if (feature.get('isVisible') !== 'true' || resolution < window.flood.maps.liveMaxBigZoom) {
      return
    }
    const severity = feature.get('severity_value')
    const isSelected = feature.get('isSelected')
    switch (severity) {
      case 3: // Severe warning
        return isSelected ? styleCache.severeSelected : styleCache.severe
      case 2: // Warning
        return isSelected ? styleCache.warningSelected : styleCache.warning
      case 1: // Alert
        return isSelected ? styleCache.alertSelected : styleCache.alert
      default: // Removed or inactive
        return isSelected ? styleCache.targetAreaSelected : styleCache.targetArea
    }
  },

  stations: (feature, resolution) => {
    if (feature.get('isVisible') !== 'true') {
      return
    }
    const state = feature.get('state')
    const isSelected = feature.get('isSelected')
    const isSymbol = resolution <= window.flood.maps.liveMaxBigZoom
    switch (state) {
      // Rivers
      case 'river':
        return isSelected ? (isSymbol ? styleCache.riverSelected : styleCache.measurementSelected) : (isSymbol ? styleCache.river : styleCache.measurement)
      case 'riverHigh':
        return isSelected ? (isSymbol ? styleCache.riverHighSelected : styleCache.measurementAlertSelected) : (isSymbol ? styleCache.riverHigh : styleCache.measurementAlert)
      case 'riverError':
        return isSelected ? (isSymbol ? styleCache.riverErrorSelected : styleCache.measurementErrorSelected) : (isSymbol ? styleCache.riverError : styleCache.measurementError)
      // Tide
      case 'tide':
        return isSelected ? (isSymbol ? styleCache.tideSelected : styleCache.measurementSelected) : (isSymbol ? styleCache.tide : styleCache.measurement)
      case 'tideError':
        return isSelected ? (isSymbol ? styleCache.tideErrorSelected : styleCache.measurementErrorSelected) : (isSymbol ? styleCache.tideError : styleCache.measurementError)
      // Ground
      case 'groundHigh':
        return isSelected ? (isSymbol ? styleCache.groundHighSelected : styleCache.measurementAlertSelected) : (isSymbol ? styleCache.groundHigh : styleCache.measurementAlert)
      case 'groundError':
        return isSelected ? (isSymbol ? styleCache.groundErrorSelected : styleCache.measurementErrorSelected) : (isSymbol ? styleCache.groundError : styleCache.measurementError)
      case 'ground':
        return isSelected ? (isSymbol ? styleCache.groundSelected : styleCache.measurementSelected) : (isSymbol ? styleCache.ground : styleCache.measurement)
    }
  },

  rainfall: (feature, resolution) => {
    if (feature.get('isVisible') !== 'true') {
      return
    }
    const state = feature.get('state')
    const isSelected = feature.get('isSelected')
    const isSymbol = resolution <= window.flood.maps.liveMaxBigZoom
    switch (state) {
      case 'rain':
        return isSelected ? (isSymbol ? styleCache.rainSelected : styleCache.measurementSelected) : (isSymbol ? styleCache.rain : styleCache.measurement)
      case 'rainDry':
        return isSelected ? (isSymbol ? styleCache.rainDrySelected : styleCache.measurementNoneSelected) : (isSymbol ? styleCache.rainDry : styleCache.measurementNone)
    }
  },

  //
  // Vector styles outlook
  //

  outlookPolygons: (feature) => {
    if (!feature.get('isVisible')) { return }
    const zIndex = feature.get('z-index')
    const lineDash = [2, 3]
    let strokeColour = '#85994b'
    let fillColour = outlookPolygonPattern('veryLow')
    if (feature.get('risk-level') === 2) {
      strokeColour = '#ffdd00'
      fillColour = outlookPolygonPattern('low')
    } else if (feature.get('risk-level') === 3) {
      strokeColour = '#F47738'
      fillColour = outlookPolygonPattern('medium')
    } else if (feature.get('risk-level') === 4) {
      strokeColour = '#D4351C'
      fillColour = outlookPolygonPattern('high')
    }
    const isSelected = feature.get('isSelected')
    const selectedStroke = new Style({ stroke: new Stroke({ color: '#FFDD00', width: 16 }), zIndex: zIndex })
    const style = new Style({
      stroke: new Stroke({ color: strokeColour, width: 1 }),
      fill: new Fill({ color: fillColour }),
      lineDash: lineDash,
      zIndex: zIndex
    })
    return isSelected ? [selectedStroke, style] : style
  },

  places: (feature, resolution) => {
    // Hide places that are not appropriate for resolution
    const d = parseInt(feature.get('d'))
    const s = parseInt(feature.get('s'))
    const r = parseInt(resolution)
    let showName = d >= 1
    if (r > 1600 && d > 1) {
      showName = false
    } else if (r > 800 && d > 2) {
      showName = false
    } else if (r > 400 && d > 3) {
      showName = false
    } else if (d > 4) {
      showName = false
    }
    if (!showName) {
      return
    }
    // Get appropriate style from cache and set text
    const textStyle = s === 1 ? styleCache.textLarge : styleCache.text
    textStyle[0].getText().setText(feature.get('n'))
    textStyle[1].getText().setText(feature.get('n'))
    return textStyle
  },

  //
  // Debug styles
  //

  bbox: (feature) => {
    return new Style({
      stroke: new Stroke({ color: '#1d70b8', width: 2, lineDash: [4, 4] }),
      fill: new Stroke({ color: 'transparent' })
    })
  }

}

//
// SVG fill paterns
//

const targetAreaPolygonPattern = (style) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  canvas.width = 8 * dpr
  canvas.height = 8 * dpr
  ctx.scale(dpr, dpr)
  switch (style) {
    case 'severe':
      ctx.fillStyle = '#D4351C'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.moveTo(0, 3.3)
      ctx.lineTo(4.7, 8)
      ctx.lineTo(3.3, 8)
      ctx.lineTo(0, 4.7)
      ctx.closePath()
      ctx.moveTo(3.3, 0)
      ctx.lineTo(4.7, 0)
      ctx.lineTo(8, 3.3)
      ctx.lineTo(8, 4.7)
      ctx.closePath()
      ctx.fill()
      break
    case 'warning':
      ctx.fillStyle = '#D4351C'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.moveTo(3.3, 0)
      ctx.lineTo(4.7, 0)
      ctx.lineTo(0, 4.7)
      ctx.lineTo(0, 3.3)
      ctx.closePath()
      ctx.moveTo(3.3, 8)
      ctx.lineTo(4.7, 8)
      ctx.lineTo(8, 4.7)
      ctx.lineTo(8, 3.3)
      ctx.closePath()
      ctx.moveTo(4.7, 0)
      ctx.lineTo(8, 3.3)
      ctx.lineTo(7.3, 4)
      ctx.lineTo(4, 0.7)
      ctx.closePath()
      ctx.moveTo(0, 4.7)
      ctx.lineTo(3.3, 8)
      ctx.lineTo(4, 7.3)
      ctx.lineTo(0.7, 4)
      ctx.closePath()
      ctx.fill()
      break
    case 'alert':
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#F47738'
      ctx.moveTo(0, 3.3)
      ctx.lineTo(0, 4.7)
      ctx.lineTo(4.7, 0)
      ctx.lineTo(3.3, 0)
      ctx.closePath()
      ctx.moveTo(3.3, 8)
      ctx.lineTo(4.7, 8)
      ctx.lineTo(8, 4.7)
      ctx.lineTo(8, 3.3)
      ctx.closePath()
      ctx.fill()
      break
    case 'removed':
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#626A6E'
      ctx.arc(4, 4, 1, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
      break
  }
  ctx.restore()
  return ctx.createPattern(canvas, 'repeat')
}

const outlookPolygonPattern = (style) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  canvas.width = 8 * dpr
  canvas.height = 8 * dpr
  ctx.scale(dpr, dpr)
  switch (style) {
    case 'high':
      ctx.fillStyle = '#D4351C'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.moveTo(0, 3.3)
      ctx.lineTo(4.7, 8)
      ctx.lineTo(3.3, 8)
      ctx.lineTo(0, 4.7)
      ctx.closePath()
      ctx.moveTo(3.3, 0)
      ctx.lineTo(4.7, 0)
      ctx.lineTo(8, 3.3)
      ctx.lineTo(8, 4.7)
      ctx.closePath()
      ctx.fill()
      break
    case 'medium':
      ctx.fillStyle = '#F47738'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.moveTo(3.3, 0)
      ctx.lineTo(4.7, 0)
      ctx.lineTo(0, 4.7)
      ctx.lineTo(0, 3.3)
      ctx.closePath()
      ctx.moveTo(3.3, 8)
      ctx.lineTo(4.7, 8)
      ctx.lineTo(8, 4.7)
      ctx.lineTo(8, 3.3)
      ctx.closePath()
      ctx.moveTo(4.7, 0)
      ctx.lineTo(8, 3.3)
      ctx.lineTo(7.3, 4)
      ctx.lineTo(4, 0.7)
      ctx.closePath()
      ctx.moveTo(0, 4.7)
      ctx.lineTo(3.3, 8)
      ctx.lineTo(4, 7.3)
      ctx.lineTo(0.7, 4)
      ctx.closePath()
      ctx.fill()
      break
    case 'low':
      ctx.fillStyle = '#ffdd00'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.moveTo(0, 3.3)
      ctx.lineTo(0, 4.7)
      ctx.lineTo(4.7, 0)
      ctx.lineTo(3.3, 0)
      ctx.closePath()
      ctx.moveTo(3.3, 8)
      ctx.lineTo(4.7, 8)
      ctx.lineTo(8, 4.7)
      ctx.lineTo(8, 3.3)
      ctx.closePath()
      ctx.fill()
      break
    case 'veryLow':
      ctx.fillStyle = '#85994b'
      ctx.fillRect(0, 0, 8, 8)
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.arc(4, 4, 1, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
      break
  }
  ctx.restore()
  return ctx.createPattern(canvas, 'repeat')
}

//
// Style caching, improves render performance
//

const createTextStyle = (options) => {
  const defaults = {
    font: '14px GDS Transport, Arial, sans-serif',
    offsetY: -12,
    radius: 2
  }
  options = Object.assign({}, defaults, options)
  return [
    new Style({
      text: new Text({
        font: options.font,
        offsetY: options.offsetY,
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    }),
    new Style({
      text: new Text({
        font: options.font,
        offsetY: options.offsetY
      }),
      image: new Circle({
        fill: new Fill({
          color: '#0b0c0c'
        }),
        stroke: new Stroke({
          width: 0
        }),
        radius: options.radius
      })
    })
  ]
}

const createIconStyle = (options) => {
  const defaults = {
    size: [100, 100],
    anchor: [0.5, 0.5],
    offset: [0, 0],
    scale: 0.5,
    zIndex: 1
  }
  options = Object.assign({}, defaults, options)
  return new Style({
    image: new Icon({
      src: '/assets/images/map-symbols-2x.png',
      size: options.size,
      anchor: options.anchor,
      offset: options.offset,
      scale: options.scale
    }),
    zIndex: options.zIndex
  })
}

const styleCache = {
  severe: createIconStyle({ offset: [0, 0], zIndex: 5 }),
  severeSelected: createIconStyle({ offset: [100, 0], zIndex: 10 }),
  warning: createIconStyle({ offset: [0, 100], zIndex: 4 }),
  warningSelected: createIconStyle({ offset: [100, 100], zIndex: 10 }),
  alert: createIconStyle({ offset: [0, 200], zIndex: 3 }),
  alertSelected: createIconStyle({ offset: [100, 200], zIndex: 10 }),
  targetArea: createIconStyle({ offset: [0, 300], zIndex: 1 }),
  targetAreaSelected: createIconStyle({ offset: [100, 300], zIndex: 10 }),
  // River
  river: createIconStyle({ offset: [0, 600], zIndex: 2 }),
  riverSelected: createIconStyle({ offset: [100, 600], zIndex: 10 }),
  riverHigh: createIconStyle({ offset: [0, 500], zIndex: 3 }),
  riverHighSelected: createIconStyle({ offset: [100, 500], zIndex: 10 }),
  riverError: createIconStyle({ offset: [0, 700], zIndex: 1 }),
  riverErrorSelected: createIconStyle({ offset: [100, 700], zIndex: 10 }),
  // Tide
  tide: createIconStyle({ offset: [0, 800], zIndex: 2 }),
  tideSelected: createIconStyle({ offset: [100, 800], zIndex: 10 }),
  tideError: createIconStyle({ offset: [0, 900], zIndex: 1 }),
  tideErrorSelected: createIconStyle({ offset: [100, 900], zIndex: 10 }),
  // Groundwater
  ground: createIconStyle({ offset: [0, 1100], zIndex: 2 }),
  groundSelected: createIconStyle({ offset: [100, 1100], zIndex: 10 }),
  groundHigh: createIconStyle({ offset: [0, 1000], zIndex: 3 }),
  groundHighSelected: createIconStyle({ offset: [100, 1000], zIndex: 10 }),
  groundError: createIconStyle({ offset: [0, 1200], zIndex: 1 }),
  groundErrorSelected: createIconStyle({ offset: [100, 1200], zIndex: 10 }),
  // Rainfall
  rain: createIconStyle({ offset: [0, 1300], zIndex: 3 }),
  rainSelected: createIconStyle({ offset: [100, 1300], zIndex: 10 }),
  rainDry: createIconStyle({ offset: [0, 1400], zIndex: 3 }),
  rainDrySelected: createIconStyle({ offset: [100, 1400], zIndex: 10 }),
  // Measurements
  measurementAlert: createIconStyle({ offset: [0, 1600], zIndex: 3 }),
  measurementAlertSelected: createIconStyle({ offset: [100, 1600], zIndex: 10 }),
  measurement: createIconStyle({ offset: [0, 1700], zIndex: 2 }),
  measurementSelected: createIconStyle({ offset: [100, 1700], zIndex: 10 }),
  measurementError: createIconStyle({ offset: [0, 1800], zIndex: 1 }),
  measurementErrorSelected: createIconStyle({ offset: [100, 1800], zIndex: 10 }),
  measurementNone: createIconStyle({ offset: [0, 1900], zIndex: 1 }),
  measurementNoneSelected: createIconStyle({ offset: [100, 1900], zIndex: 10 }),
  text: createTextStyle(),
  textLarge: createTextStyle({ font: 'Bold 16px GDS Transport, Arial, sans-serif', offsetY: -13, radius: 3 })
}
