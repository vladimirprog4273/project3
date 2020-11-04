const path = require('path')

module.exports = ({ fs, pushData }) => async ({ options, logger }) => {
  logger.debug('Executing push csv command')

  const filePath = path.resolve(options.file)

  await pushData(fs.readFileSync(filePath, { encoding: 'utf8' }), options, logger)
}
