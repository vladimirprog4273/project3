const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { asValue } = require('awilix')
const { chalk } = require('@caporal/core')
const { createARGV } = require('../../utils')
const Container = require('../../../lib/container')

const REQUIRED_OPTIONS = require('./fixtures/required-options.json')

chai.use(chaiAsPromised)
const { expect } = chai

describe('Push csv file', () => {
  let pushDataStub
  let program
  const readContent = ''

  let logger

  beforeEach(() => {
    const container = Container()

    logger = {
      level: container.resolve('config').logLevel,
      debug: () => {},
      // eslint-disable-next-line accessor-pairs
      set silent (value) {
        logger.level = 'warn'
      }
    }

    chalk.level = 0

    const fakeFs = {
      readFileSync: () => readContent
    }

    pushDataStub = sinon.stub().resolves()

    container.register({
      pushData: asValue(pushDataStub),
      logger: asValue(logger),
      fs: asValue(fakeFs)
    })

    program = container.resolve('program')
  })

  it('should use default configuration if not overridden by command line parameters', async () => {
    const argv = createARGV('push csv', REQUIRED_OPTIONS)
    await program.run(argv)
    expect(pushDataStub.getCalls()).to.have.lengthOf(1)
    expect(pushDataStub.getCall(0).args[1]).to.eql({
      columns: ['displayName', 'email'],
      sitePassword: 'passwd',
      siteEmail: 'email@mail.me',
      file: 'input-file',
      resource: 'staff',
      attributesUpdateMode: 'replace',
      removeUnmatchedMode: 'none'
    })
  })

  it('should override default configuration with command line parameters', async () => {
    const argv = createARGV('push csv', {
      '--site-uri': 'http://test.com',
      '--site-email': 'test@email.com',
      '--site-password': 'password',
      '--file': 'test-file',
      '--columns': 'displayName,email,floorLabel',
      '--attributes-update-mode': 'merge',
      '--remove-unmatched-mode': 'all'
    })
    await program.run(argv)
    expect(pushDataStub.getCalls()).to.have.lengthOf(1)
    expect(pushDataStub.getCall(0).args[1]).to.eql({
      siteUri: 'http://test.com',
      siteEmail: 'test@email.com',
      sitePassword: 'password',
      file: 'test-file',
      columns: ['displayName', 'email', 'floorLabel'],
      resource: 'staff',
      attributesUpdateMode: 'merge',
      removeUnmatchedMode: 'all'
    })
  })

  Object.keys(REQUIRED_OPTIONS).forEach(param => {
    it(`should throw error if required options is missing: ${param}`, async () => {
      const options = { ...REQUIRED_OPTIONS }
      delete options[param]
      const argv = createARGV('push csv', options)
      return expect(program.run(argv)).to.rejectedWith(`Missing required flag ${param}`)
    })
  })

  it('should fail if resource option not in available list', async () => {
    const argv = createARGV('push csv', {
      ...REQUIRED_OPTIONS,
      '--resource': 'not_exists'
    })
    return expect(program.run(argv)).to.rejectedWith("Expected one of 'staff', 'desks', 'rooms', 'utilities'")
  })

  it('should fail if attributesUpdateMode option not in available list', async () => {
    const argv = createARGV('push csv', {
      ...REQUIRED_OPTIONS,
      '--attributes-update-mode': 'not_exists'
    })
    return expect(program.run(argv)).to.rejectedWith("Expected one of 'replace', 'merge'")
  })

  it('should fail if removeUnmatchedMode option not in available list', async () => {
    const argv = createARGV('push csv', {
      ...REQUIRED_OPTIONS,
      '--remove-unmatched-mode': 'not_exists'
    })
    return expect(program.run(argv)).to.rejectedWith("Expected one of 'none', 'floorScope', 'all'")
  })

  it('should call pushData with readFileSync result', async () => {
    const argv = createARGV('push csv', { ...REQUIRED_OPTIONS })
    await program.run(argv)
    sinon.assert.calledOnce(pushDataStub)
    sinon.assert.calledWith(pushDataStub, readContent)
  })

  describe('verbose and quite options', () => {
    it('should set logger log level to "info" by default', async () => {
      const argv = createARGV('push csv', REQUIRED_OPTIONS)
      await program.run(argv)
      expect(logger.level).equal('info')
    })

    it('should set logger log level to "warn" if --quiet option is provided', async () => {
      const argv = createARGV('push csv', { ...REQUIRED_OPTIONS, '--quiet': null })
      await program.run(argv)
      expect(logger.level).equal('warn')
    })

    it('should set logger log level to "warn" if --silent option is provided', async () => {
      const argv = createARGV('push csv', { ...REQUIRED_OPTIONS, '--silent': null })
      await program.run(argv)
      expect(logger.level).equal('warn')
    })

    it('should set logger log level to "silly" if --verbose option is provided', async () => {
      const argv = createARGV('push csv', { ...REQUIRED_OPTIONS, '--verbose': null })
      await program.run(argv)
      expect(logger.level).equal('silly')
    })

    it('should set logger log level to "silly" if --v option is provided', async () => {
      const argv = createARGV('push csv', { ...REQUIRED_OPTIONS, '-v': null })
      await program.run(argv)
      expect(logger.level).equal('silly')
    })
  })
})
