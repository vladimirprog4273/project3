const parse = require('csv-parse/lib/sync')
const csvStringify = require('csv-stringify/lib/sync')

module.exports = (inputCSV, { overrideJson, attributes }) => {
  if (!overrideJson) {
    return inputCSV
  }

  const csv = parse(inputCSV, { columns: true })

  Object.entries(overrideJson).forEach(([key, value]) => {
    if (!attributes.includes(key)) {
      return
    }

    csv.forEach((row) => {
      if (key in row) {
        row[key] = value
      }
    })
  })

  return csvStringify(csv, { header: true })
}
