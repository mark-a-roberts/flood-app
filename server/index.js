const hapi = require('@hapi/hapi')
const config = require('./config')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      cors: true,
      security: true
    }
  })

  // Register the plugins
  await server.register(require('@hapi/inert'))
  await server.register(require('@hapi/h2o2'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))
  await server.register(require('./plugins/on-post-handler'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/data-schedule'))
  await server.register(require('blipp'))
  await server.register(require('./plugins/logging'))

  return server
}

module.exports = createServer
