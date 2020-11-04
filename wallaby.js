module.exports = () => ({
  files: [
    '**/*.js',
    '!**/*.spec.js',
    '!node_modules/**/*.*'
  ],

  tests: [
    '**/*.spec.js'
  ],

  workers: {
    recycle: true
  },

  env: {
    type: 'node'
  },

  testFramework: 'mocha'
})
