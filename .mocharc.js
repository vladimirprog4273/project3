module.exports = {
  extension: ['js'],
  spec: [
    './lib/**/*.spec.js',
    './test/**/*.spec.js'
  ],
  package: './package.json',
  reporter: 'spec',
  timeout: 5000,
  recursive: true
}
