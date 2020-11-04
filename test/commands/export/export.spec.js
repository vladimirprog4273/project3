const fs = require('fs')
const path = require('path')
const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { asValue } = require('awilix')
const { chalk } = require('@caporal/core')
const { createARGV } = require('../../utils')
const Container = require('../../../lib/container')

const REQUIRED_OPTIONS = require('./fixtures/required-options.json')
const LDAP_DATA = require('./fixtures/ldap-data.json')
const LDAP_DATA_CSV = fs.readFileSync(path.resolve(__dirname, 'fixtures/ldap-data.csv'), { encoding: 'utf8' })

chai.use(chaiAsPromised)
const { expect } = chai

describe('export', () => {
  let getUsersStub
  let saveFileStub
  let convertToCSVStub
  let program

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

    getUsersStub = sinon.stub().resolves(LDAP_DATA)
    saveFileStub = sinon.stub().resolves()
    convertToCSVStub = sinon.stub().resolves(LDAP_DATA_CSV)

    container.register({
      getUsers: asValue(getUsersStub),
      saveFile: asValue(saveFileStub),
      convertToCSV: asValue(convertToCSVStub),
      logger: asValue(logger)
    })

    program = container.resolve('program')
  })

  it('should use default configuration if not overridden by command line parameters', async () => {
    const argv = createARGV('export', REQUIRED_OPTIONS)
    await program.run(argv)
    expect(getUsersStub.getCalls()).to.have.lengthOf(1)
    expect(getUsersStub.getCall(0).args[0]).to.eql({
      ldapUri: 'ldap://10.0.1.15:636',
      ldapPassword: 'passwd',
      ldapUsername: 'admin',
      baseDn: 'cn=*',
      output: 'output-file',
      format: 'json',
      attributes: ['displayName', 'userPrincipalName'],
      uuidAttributes: ['objectGUID'],
      base64Attributes: ['objectSid', 'thumbnailPhoto', 'jpegPhoto']
    })
  })

  it('should override default configuration with command line parameters', async () => {
    const argv = createARGV('export', {
      ...REQUIRED_OPTIONS,
      '--format': 'csv',
      '--attributes': 'userPrincipalName,seatId,officePhone',
      '--base64-attributes': 'image1,image2',
      '--uuid-attributes': 'objectGUID,additionalIDAttribute'
    })
    await program.run(argv)
    expect(getUsersStub.getCalls()).to.have.lengthOf(1)
    expect(getUsersStub.getCall(0).args[0]).to.eql({
      ldapUri: 'ldap://10.0.1.15:636',
      ldapPassword: 'passwd',
      ldapUsername: 'admin',
      baseDn: 'cn=*',
      output: 'output-file',
      format: 'csv',
      attributes: ['userPrincipalName', 'seatId', 'officePhone'],
      uuidAttributes: ['objectGUID', 'additionalIDAttribute'],
      base64Attributes: ['image1', 'image2']
    })
  })

  Object.keys(REQUIRED_OPTIONS).forEach(param => {
    it(`should throw error if required options is missing: ${param}`, async () => {
      const options = { ...REQUIRED_OPTIONS }
      delete options[param]
      const argv = createARGV('export', options)
      return expect(program.run(argv)).to.rejectedWith(`Missing required flag ${param}`)
    })
  })

  it('should fail if format option is neither json, nor csv', async () => {
    const argv = createARGV('export', {
      ...REQUIRED_OPTIONS,
      '--format': 'xml'
    })
    return expect(program.run(argv)).to.rejectedWith("Expected one of 'json', 'csv'")
  })

  it('should get users from LDAP server and save as CSV file if format set to "csv"', async () => {
    const argv = createARGV('export', {
      ...REQUIRED_OPTIONS,
      '--attributes': 'userPrincipalName,objectGUID,displayName,seatIDAttr',
      '--format': 'csv'
    })
    await program.run(argv)
    sinon.assert.calledOnce(getUsersStub)
    sinon.assert.calledOnce(saveFileStub)
    sinon.assert.calledWith(saveFileStub, LDAP_DATA_CSV)
  })

  it('should get users from LDAP server and save as JSON file if format set to "json"', async () => {
    const argv = createARGV('export', {
      ...REQUIRED_OPTIONS,
      '--format': 'json'
    })
    await program.run(argv)
    sinon.assert.calledOnce(getUsersStub)
    sinon.assert.calledOnce(saveFileStub)
    sinon.assert.calledWith(saveFileStub, JSON.stringify(LDAP_DATA))
  })

  describe('verbose and quite options', () => {
    it('should set logger log level to "info" by default', async () => {
      const argv = createARGV('export', REQUIRED_OPTIONS)
      await program.run(argv)
      expect(logger.level).equal('info')
    })

    it('should set logger log level to "warn" if --quiet option is provided', async () => {
      const argv = createARGV('export', { ...REQUIRED_OPTIONS, '--quiet': null })
      await program.run(argv)
      expect(logger.level).equal('warn')
    })

    it('should set logger log level to "warn" if --silent option is provided', async () => {
      const argv = createARGV('export', { ...REQUIRED_OPTIONS, '--silent': null })
      await program.run(argv)
      expect(logger.level).equal('warn')
    })

    it('should set logger log level to "silly" if --verbose option is provided', async () => {
      const argv = createARGV('export', { ...REQUIRED_OPTIONS, '--verbose': null })
      await program.run(argv)
      expect(logger.level).equal('silly')
    })

    it('should set logger log level to "silly" if --v option is provided', async () => {
      const argv = createARGV('export', { ...REQUIRED_OPTIONS, '-v': null })
      await program.run(argv)
      expect(logger.level).equal('silly')
    })
  })
})
