#!/usr/bin/env node

const Container = require('./lib/container')
const program = Container().resolve('program')

program.run(process.argv.slice(2))
