const _ = require('lodash')
const assert = require('assert')
const csvStringify = require('csv-stringify')
const logger = require('../logger')

module.exports = async (data, columns) => {
  logger.debug('Converting data to CSV')

  assert(typeof data === 'object')
  assert(Array.isArray(data))
  assert(typeof columns === 'object')
  assert(Array.isArray(columns))

  function normalizeColumns (columns) {
    if (!columns.includes('*')) {
      return columns
    }
    return data.reduce((acc, item) => {
      acc = [...acc, ...Object.keys(item)]
      acc = _.uniq(acc)
      return acc
    }, [])
  }

  const options = {
    header: true,
    columns: normalizeColumns(columns)
  }

  const csvContent = await new Promise((resolve, reject) => {
    csvStringify(data, options, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })

  return csvContent
}
