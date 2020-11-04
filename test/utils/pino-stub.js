const assert = require('assert')
const pino = require('pino')

function pinoStub (options) {
  assert(typeof options === 'object')

  // Disable logging
  options.hooks = {
    logMethod: function noop () {}
  }

  return pino(options)
}

// proxyquire addition
pinoStub['@global'] = true

module.exports = pinoStub
