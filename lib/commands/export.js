const assert = require('assert')

module.exports = ({ getUsers, convertToCSV, saveFile }) => async ({ options, logger }) => {
  assert(['csv', 'json'].includes(options.format))

  const users = await getUsers(options)

  if (options.format === 'csv') {
    const content = await convertToCSV(users, options.attributes)
    await saveFile(content, options)
    return
  }

  logger.debug('Converting data to JSON')
  const content = JSON.stringify(users)
  await saveFile(content, options)
}
