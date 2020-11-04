const assert = require('assert')

module.exports = function createARGV (command, options) {
  assert(typeof command === 'string')
  assert(command.length > 0)
  assert(typeof options === 'object')

  const args = Object.keys(options).reduce((acc, key) => {
    acc.push(key)
    if (options[key] !== null) {
      acc.push(options[key])
    }
    return acc
  }, [])

  return [command, ...args]
}
