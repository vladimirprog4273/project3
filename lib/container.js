const { createContainer, asValue, asFunction } = require('awilix')
const fs = require('fs')
const axios = require('axios')

const config = require('./config')
const logger = require('./logger')

const program = require('./program')

const exportCommand = require('./commands/export')

const pushData = require('./utils/push-data')
const pushCsv = require('./commands/push-csv')

const convertToCSV = require('./utils/convert-to-csv')
const overrideJson = require('./utils/override-json')

module.exports = () => {
  const container = createContainer()

  container.register({
    config: asValue(config),

    program: asFunction(program).singleton(),

    exportCommand: asFunction(exportCommand).singleton(),
    pushCsv: asFunction(pushCsv).singleton(),

    pushData: asFunction(pushData).singleton(),
    convertToCSV: asValue(convertToCSV),
    overrideJson: asValue(overrideJson),

    logger: asValue(logger),
    axios: asValue(axios),
    fs: asValue(fs)
  })

  return container
}
