const pino = require('pino')

const logger = pino({
  hooks: {
    logMethod: function noop () {}
  }
})

module.exports = logger
