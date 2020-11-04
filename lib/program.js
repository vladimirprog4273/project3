const { Program } = require('@caporal/core')
const packageJSON = require('../package.json')

const {
  ldapUriValidator, uriValidator, jsonValidator
} = require('./utils/validators')

module.exports = ({ config, exportCommand, pushCsv, pushLdap, logger }) => {
  process.on('uncaughtException', function (err) {
    logger.error(err)
  })

  const program = new Program()

  program
    .version(packageJSON.version)
    .logger(logger)

  addStandardHelp(program)

  const exportProgramCommand = program
    .command('export', 'Export data from LDAP server to local file')
    .help('Command downloads the data from the LDAP server and saves it locally as a CSV or JSON file.')

  addStandardHelp(exportProgramCommand)

  addExportOptions(exportProgramCommand)
    .option('--format <format>', 'output data format: "json" or "csv"', { validator: ['json', 'csv'], default: config.format })
    .option('--output <file>', 'write data to <file>', { validator: program.STRING, default: config.output, required: true })
    .action(exportCommand)

  addStandardHelp(pushCsvCommand)

  addPushOptions(pushCsvCommand)
    .option('--file <file>', 'path to <file>', { validator: program.STRING, default: config.file, required: true })
    .action(pushCsv)

  addStandardHelp(pushLdapCommand)

  addPushOptions(addExportOptions(pushLdapCommand))
    .action(pushLdap)

  return program
}
