const pino = require('pino')
const config = require('./config')

const logger = pino(
  {
    level: config.logLevel,
    prettyPrint: {
      translateTime: true,
      ignore: 'hostname',
      errorProps: 'details'
    },
    customLevels: {
      silly: 20
    }
  },
  pino.destination(1)
)

// eslint-disable-next-line accessor-pairs
Object.defineProperty(logger, 'silent', {
  set: () => {
    /* istanbul ignore next */
    logger.level = 'warn'
  }
})

module.exports = logger
