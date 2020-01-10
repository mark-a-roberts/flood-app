'use strict'

const Hapi = require('@hapi/hapi')
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const sinon = require('sinon')
const lab = exports.lab = Lab.script()

lab.experiment('Routes test - location - location-1sw-2w-1a', () => {
  let sandbox
  let server

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    delete require.cache[require.resolve('../../server/util.js')]
    delete require.cache[require.resolve('../../server/services/location.js')]
    delete require.cache[require.resolve('../../server/services/flood.js')]
    delete require.cache[require.resolve('../../server/routes/location.js')]
    sandbox = await sinon.createSandbox()
    server = Hapi.server({
      port: 3000,
      host: 'localhost'
    })
  })

  lab.afterEach(async () => {
    await server.stop()
    await sandbox.restore()
  })

  lab.test('GET /location with query parameters for location-1sw-2w-1a', async () => {
    // Tests known location

    const floodService = require('../../server/services/flood')

    const fakeIsEngland = () => {
      return { is_england: true }
    }
    // const fakePlaceData = () => {}
    const fakeFloodsData = () => {
      return {
        floods: [
          {
            code: '053WAF117BED',
            key: 180379,
            description: 'Barlings Eau and Duckpool Catchwater',
            quickdialnumber: '207012',
            region: 'Anglian',
            area: 'Northern',
            floodtype: 'f',
            severity: 1,
            severitydescription: 'Severe Flood Warning',
            warningkey: 108229,
            raised: '2020-01-06T11:58:00.000Z',
            severitychanged: '2019-11-07T15:43:00.000Z',
            messagechanged: '2020-01-06T11:58:00.000Z',
            message: 'River levels remain high.  Heavy rain is forecast for Wednesay 8th and Thursday 9th January and we continue to monitor the situation. Environment Agency contractors have repaired the breached banks at Short Ferry. However, Short Ferry road will remain closed for several weeks until the water has been pumped back into the river.  The pumps are operating again now that river levels have fallen sufficiently.  Do not walk on flood banks and please avoid using low lying footpaths near local watercourses, which may be flooded. We are monitoring river levels and will update this message on Tuesday 7th January, or as the situation changes.'
          },
          {
            code: '053WAF116TLW',
            key: 180378,
            description: 'Lower River Witham',
            quickdialnumber: '207011',
            region: 'Anglian',
            area: 'Northern',
            floodtype: 'f',
            severity: 2,
            severitydescription: 'Flood Warning',
            warningkey: 108310,
            raised: '2020-01-06T11:54:00.000Z',
            severitychanged: '2019-11-07T20:46:00.000Z',
            messagechanged: '2020-01-06T11:54:00.000Z',
            message: 'River levels remain high. Heavy rain is forecast for Wednesay 8th and Thursday 9th January and we continue to monitor the situation. Environment Agency contractors have undertaken repairs to the breach at Timberland Delph and on the Barlings Eau.  Flooding of low lying land and roads close to the river remains a possibility.  We are monitoring the situation.  Do not walk on flood banks and avoid using low lying footpaths and roads near to watercourses.  This message will be updated on Tuesday, 7th January, or as the situation changes.'
          },
          {
            code: '053WAF116TLW',
            key: 180378,
            description: 'Lower River Witham',
            quickdialnumber: '207011',
            region: 'Anglian',
            area: 'Northern',
            floodtype: 'f',
            severity: 2,
            severitydescription: 'Flood Warning',
            warningkey: 108310,
            raised: '2020-01-06T11:54:00.000Z',
            severitychanged: '2019-11-07T20:46:00.000Z',
            messagechanged: '2020-01-06T11:54:00.000Z',
            message: 'River levels remain high. Heavy rain is forecast for Wednesay 8th and Thursday 9th January and we continue to monitor the situation. Environment Agency contractors have undertaken repairs to the breach at Timberland Delph and on the Barlings Eau.  Flooding of low lying land and roads close to the river remains a possibility.  We are monitoring the situation.  Do not walk on flood banks and avoid using low lying footpaths and roads near to watercourses.  This message will be updated on Tuesday, 7th January, or as the situation changes.'
          },
          {
            code: '053WAF116TLW',
            key: 180378,
            description: 'Lower River Witham',
            quickdialnumber: '207011',
            region: 'Anglian',
            area: 'Northern',
            floodtype: 'f',
            severity: 3,
            severitydescription: 'Flood Alert',
            warningkey: 108310,
            raised: '2020-01-06T11:54:00.000Z',
            severitychanged: '2019-11-07T20:46:00.000Z',
            messagechanged: '2020-01-06T11:54:00.000Z',
            message: 'River levels remain high. Heavy rain is forecast for Wednesay 8th and Thursday 9th January and we continue to monitor the situation. Environment Agency contractors have undertaken repairs to the breach at Timberland Delph and on the Barlings Eau.  Flooding of low lying land and roads close to the river remains a possibility.  We are monitoring the situation.  Do not walk on flood banks and avoid using low lying footpaths and roads near to watercourses.  This message will be updated on Tuesday, 7th January, or as the situation changes.'
          }
        ]
      }
    }
    const fakeStationsData = () => []
    const fakeImpactsData = () => []

    sandbox.stub(floodService, 'getIsEngland').callsFake(fakeIsEngland)
    sandbox.stub(floodService, 'getFloodsWithin').callsFake(fakeFloodsData)
    sandbox.stub(floodService, 'getStationsWithin').callsFake(fakeStationsData)
    sandbox.stub(floodService, 'getImpactsWithin').callsFake(fakeImpactsData)

    const fakeGetJson = () => {
      return {
        authenticationResultCode: 'ValidCredentials',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Location:http://schemas.microsoft.com/search/local/ws/rest/v1',
                bbox: [53.367538452148437, -2.6395580768585205, 53.420841217041016, -2.5353000164031982],
                name: 'Warrington, Warrington',
                point: {
                  type: 'Point',
                  coordinates: [53.393871307373047, -2.5893499851226807]
                },
                address: {
                  adminDistrict: 'England',
                  adminDistrict2: 'Warrington',
                  countryRegion: 'United Kingdom',
                  formattedAddress: 'Warrington, Warrington',
                  locality: 'Warrington',
                  countryRegionIso2: 'GB'
                },
                confidence: 'Medium',
                entityType: 'PopulatedPlace',
                geocodePoints: [
                  {
                    type: 'Point',
                    coordinates: [53.393871307373047, -2.5893499851226807],
                    calculationMethod: 'Rooftop',
                    usageTypes: ['Display']
                  }
                ],
                matchCodes: ['Good']
              }
            ]
          }
        ],
        statusCode: 200,
        tatusDescription: 'OK',
        traceId: 'trace-id'
      }
    }

    const util = require('../../server/util')
    sandbox.stub(util, 'getJson').callsFake(fakeGetJson)

    const locationPlugin = {
      plugin: {
        name: 'location',
        register: (server, options) => {
          server.route(require('../../server/routes/location'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(require('../../server/plugins/session'))
    await server.register(locationPlugin)

    await server.initialize()
    const options = {
      method: 'GET',
      url: '/location?q=Warrington'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.contain('There is a danger to life')
    Code.expect(response.payload).to.contain('A severe flood warning is in force for ')
    Code.expect(response.payload).to.contain('2&nbsp;flood warnings<')
    Code.expect(response.payload).to.contain('1&nbsp;flood alert<')
  })
})