// const hoek = require('hoek')
const moment = require('moment-timezone')
const config = require('../../config')
const Station = require('./station-data')
const Forecast = require('./station-forecast')

function dateDiff (date1, date2) {
  return moment(date1).diff(moment(date2), 'days')
}

class ViewModel {
  constructor (options) {
    const { station, telemetry, forecast } = options

    Object.assign(this, {
      pageTitle: `Flood information for ${station.name}`
    })

    this.station = new Station(station)
    this.id = this.station.id
    this.telemetry = telemetry || []
    this.catchments = []
    this.date = new Date()
    this.status = this.station.status
    this.outOfDate = dateDiff(Date.now(), this.station.statusDate) <= 5
    this.porMaxValueIsProvisional = false
    this.station.floodingIsPossible = false
    this.station.hasPercentiles = true

    const now = moment(Date.now())
    const numberOfProvisionalDays = config.provisionalPorMaxValueDays

    // Provisional por max date
    if (this.station.porMaxDate) {
      if (this.station.type === 's' || this.station.type === 'm' || this.station.type === 'g') {
        const diff = moment.duration(now.diff(this.station.porMaxDate))
        if (diff.asDays() < numberOfProvisionalDays) {
          this.station.porMaxValueIsProvisional = true
        }
        this.station.formattedPorMaxDate = moment(this.station.porMaxDate).format('DD/MM/YY')
      }
    }

    // Gets the latest value object
    if (this.telemetry.length) {
      this.readings = this.telemetry.length
      this.recentValue = this.telemetry[0]
      this.station.recentValue = this.recentValue
    }

    const coordinates = JSON.parse(this.station.coordinates).coordinates
    coordinates.reverse()
    this.lat = coordinates[0]
    this.long = coordinates[1]
    this.warningsUrl = `/warnings?stationid=${this.id}`

    if (this.station.type === 'c') {
      this.title = 'Tidal level'
      this.pageTitle = 'Tidal level information for ' + this.station.river + ' at ' + this.station.name
      this.postTitle = 'Latest tidal level information for the ' + this.station.river + ' at ' + this.station.name
    } else if (this.station.type === 'g') {
      this.title = 'Groundwater level'
      this.pageTitle = 'Groundwater level information for ' + this.station.name + ' borehole'
      this.postTitle = 'Latest groundwater level information for ' + this.station.name + ' borehole'
    } else {
      this.title = 'River level'
      this.pageTitle = 'River level information for ' + this.station.river + ' at ' + this.station.name + (this.station.isMulti ? ' (' + this.station.direction + ')' : '')
      this.postTitle = 'Latest river level information for the ' + this.station.river + ' at ' + this.station.name + (this.station.isMulti ? ' (' + this.station.direction + ')' : '')
    }

    this.isUpstream = this.station.direction === 'upstream'
    this.isDownstream = this.station.direction === 'downstream'

    // FFOI processing
    if (forecast) {
      const { thresholds } = forecast
      this.isFfoi = thresholds.length > 0
      if (this.isFfoi) {
        this.ffoi = new Forecast(forecast, this.station.isCoastal, this.station.recentValue)
        this.hasForecast = this.ffoi.hasForecastData
        this.alertThreshold = this.ffoi.alertThreshold || this.station.percentile5
        this.warningThreshold = this.ffoi.warningThreshold || null
      }
      this.phase = this.isFfoi ? 'beta' : false
    }

    // River level and forecast message
    this.atRiskFAL = this.alertThreshold &&
      ((this.recentValue && parseFloat(this.recentValue._)) >= parseFloat(this.alertThreshold) ||
      (this.hasForecast && this.ffoi.maxValue && parseFloat(this.ffoi.maxValue._) >= parseFloat(this.alertThreshold)))

    this.atRiskFW = this.warningThreshold &&
      ((this.recentValue && parseFloat(this.recentValue._)) >= parseFloat(this.warningThreshold) ||
      (this.hasForecast && this.ffoi.maxValue && parseFloat(this.ffoi.maxValue._) >= parseFloat(this.warningThreshold)))

    // Alerts and percentiles
    this.station.floodingIsPossible = this.atRiskFAL || this.atRiskFW

    if (this.recentValue && this.station.percentile5 && this.station.percentile95) {
      if (!isNaN(this.station.percentile5) && !isNaN(this.station.percentile95)) {
        if (parseFloat(this.recentValue._) >= parseFloat(this.station.percentile5)) {
          this.station.floodingIsPossible = true
        }
      } else {
        this.station.hasPercentiles = false
      }
    } else {
      this.station.hasPercentiles = false
    }

    this.centroidJSON = JSON.stringify(coordinates)
    this.stationJSON = JSON.stringify(this.station)
    this.forecast = this.ffoi || {}
    this.forecastJSON = this.ffoi ? this.ffoi.forecastJSON : JSON.stringify({})

    // Page category for feedback categorisation
    this.pageCategory = this.isFfoi ? 'station-ffoi' : ''
  }
}

module.exports = ViewModel
