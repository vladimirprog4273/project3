const path = require('path')

if (process.env.NODE_CONFIG_DIR === undefined) {
  process.env.NODE_CONFIG_DIR = path.join(__dirname, '../config/')
}

const config = require('config')

module.exports = config
