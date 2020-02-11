const util = require('../util')
const config = require('../config')
const serviceUrl = config.serviceUrl

// cached flood data
const Floods = require('../models/floods')
const Outlook = require('../models/outlook')
let floods = null
let outlook = null
let stationsGeojson = null

module.exports = {
  // ############ Internals ################
  // get cached floods object
  get floods () {
    return floods
  },
  // set the cached floods object
  set floods (data) {
    floods = data && new Floods(data)
  },
  // get cached outlook object
  get outlook () {
    return outlook
  },
  // set cached outlook object
  set outlook (data) {
    outlook = data && new Outlook(data)
  },

  get stationsGeojson () {
    return stationsGeojson
  },

  set stationsGeojson (data) {
    stationsGeojson = data
  },

  // ############### Externals ################
  // get floods from service (should only be used by serverside scheduled job)
  getFloods () {
    return util.getJson(`${serviceUrl}/floods`)
  },

  getFloodsWithin (bbox) {
    return util.getJson(`${serviceUrl}/floods-within/${bbox[0]}/${bbox[1]}/${bbox[2]}/${bbox[3]}`)
  },

  getFloodArea (code) {
    // 5th character of code states "w" or "a"
    // for warning or alert flood area types
    const type = code.charAt(4).toLowerCase() === 'w'
      ? 'warning'
      : 'alert'

    return util.getJson(`${serviceUrl}/flood-area/${type}/${code}`)
  },

  getOutlook () {
    return util.getJson(`${serviceUrl}/flood-guidance-statement`, true)
  },

  getStationById (id, direction) {
    return util.getJson(`${serviceUrl}/station/${id}/${direction}`)
  },

  getStationsWithin (bbox) {
    return util.getJson(`${serviceUrl}/stations-within/${bbox[0]}/${bbox[1]}/${bbox[2]}/${bbox[3]}`)
  },

  getStationsUpstreamDownstream (id, direction) {
    return util.getJson(`${serviceUrl}/stations-upstream-downstream/${id}/${direction}`)
  },

  getStationsWithinRadius (lng, lat, radiusM = 10000) {
    return util.getJson(`${serviceUrl}/stations-within/${lng}/${lat}/${radiusM}`)
  },

  getStationTelemetry (id, direction) {
    return util.getJson(`${serviceUrl}/station/${id}/${direction}/telemetry`)
  },

  getStationForecastThresholds (id) {
    return util.getJson(`${serviceUrl}/station/${id}/forecast/thresholds`)
  },

  getStationForecastData (id) {
    return util.getJson(`${serviceUrl}/station/${id}/forecast/data`)
  },

  getStationsGeoJson () {
    const url = config.geoserverUrl + '/geoserver/flood/ows?service=wfs&' +
              'version=2.0.0&request=GetFeature&typeNames=flood:stations&propertyName=name,river,status,atrisk,type,is_ffoi,is_ffoi_at_risk,ffoi_max,ffoi_date,value,value_date,percentile_95,percentile_5&' +
              'outputFormat=application/json'
    return util.getJson(url)
  },

  getIsEngland (lng, lat) {
    return util.getJson(`${serviceUrl}/is-england/${lng}/${lat}`)
  },

  getImpactData (id) {
    return util.getJson(`${serviceUrl}/impacts/${id}`)
  },

  getImpactsWithin (bbox) {
    return util.getJson(`${serviceUrl}/impacts-within/${bbox[0]}/${bbox[1]}/${bbox[2]}/${bbox[3]}`)
  }
}
