const floodService = require('../services/flood')
const moment = require('moment-timezone')
const util = require('../../server/util')

module.exports = {
  method: 'GET',
  path: '/rainfall-station-csv/{id}',
  handler: async (request, h) => {
    const { id } = request.params

    const [rainfallStation, rainfallStationTelemetry] = await Promise.all([
      floodService.getRainfallStation(id),
      floodService.getRainfallStationTelemetry(id)
    ])

    const stationName = rainfallStation[0].station_name.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase())

    const valueDuration = rainfallStationTelemetry[0].period === '15 min' ? 15 : 45

    const values = util.formatRainfallTelemetry(rainfallStationTelemetry, valueDuration)

    values.forEach(function (item) {
      item.ts = moment.utc(item.dateTime).format()
      item.value = Number(util.formatValue(item.value))
    })

    values.sort(function (a, b) {
      return new Date(a.ts) - new Date(b.ts)
    })

    this.csvString = [
      [
        'Timestamp (UTC)',
        'Rainfall (mm)'
      ],
      ...values.map(item => [
        item.ts,
        item.value
      ])
    ]
      .map(e => e.join(','))
      .join('\n')

    const response = h.response(this.csvString)
    response.type('text/csv')
    response.header('Content-disposition', `attachment; filename=${stationName}-rainfall-data.csv`)
    return response
  }
}
