const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const { expect } = chai
const sinon = require('sinon')

const PushData = require('./push-data')

describe('PushData', () => {
  const logger = { debug: () => {}, info: () => {}, error: () => {} }

  function createPushData (postStub, l = logger, overrideJson = (s) => s) {
    return PushData({
      axios: { post: postStub },
      overrideJson,
      logger: l
    })
  }

  it('should throw error about auth if axios.post rejected with 401', async () => {
    const err = new Error()
    err.response = { status: 401 }
    const pushData = createPushData(sinon.stub().rejects(err))

    const res = pushData({}, {})

    return expect(res).to.rejectedWith('Error on authentication: incorrect email/password')
  })

  it('should throw just error on other axios.post rejections', async () => {
    const pushData = createPushData(sinon.stub().rejects())

    const res = pushData({}, {})

    return expect(res).to.rejectedWith('Error')
  })

  it('should error if no "set-cookie" in headers', () => {
    const pushData = createPushData(sinon.stub().resolves({ headers: {} }))

    const res = pushData({}, {})

    return expect(res).to.rejectedWith("Error on authentication: 'set-cookie' doesn't exists in headers")
  })

  it('should error if no session_id in "set-cookie"', () => {
    const pushData = createPushData(sinon.stub().resolves({ headers: { 'set-cookie': ['cook'] } }))

    const res = pushData({}, {})

    return expect(res).to.rejectedWith("Error on authentication: 'set-cookie' doesn't contain session_id")
  })

  it('should throw just error on axios.post to import/files', () => {
    const postStub = sinon.stub()
    postStub.onFirstCall().resolves({ headers: { 'set-cookie': ['session_id=sessid1;'] } })
    postStub.onSecondCall().rejects()
    const pushData = createPushData(postStub)

    const res = pushData('', {})

    return expect(res).to.rejectedWith('Error')
  })

  it('should throw just error on axios.post to import/jobs', () => {
    const postStub = sinon.stub()
    postStub.onFirstCall().resolves({ headers: { 'set-cookie': ['session_id=sessid1;'] } })
    postStub.onSecondCall().resolves({ data: { id: 'id1' } })
    postStub.onThirdCall().rejects()
    const pushData = createPushData(postStub)

    const res = pushData('', { columns: '' })

    return expect(res).to.rejectedWith('Error')
  })

  it('should log error on axios.post to import/jobs', async () => {
    const postStub = sinon.stub()
    postStub.onFirstCall().resolves({ headers: { 'set-cookie': ['session_id=sessid1;'] } })
    postStub.onSecondCall().resolves({ data: { id: 'id1' } })
    const err = { response: { data: { message: 'mes' } } }
    postStub.onThirdCall().rejects(err)
    const loggerStub = { ...logger, error: sinon.spy() }
    const pushData = createPushData(postStub, loggerStub)

    try {
      await pushData('', { columns: '' })
    } catch (e) {
      expect(loggerStub.error.getCalls()).to.have.lengthOf(1)
      expect(loggerStub.error.getCall(0).args[0]).to.eql({ err: { message: 'mes' } })
    }
  })

  it('should call logger info with message on complete', async () => {
    const postStub = sinon.stub()
    postStub.onFirstCall().resolves({ headers: { 'set-cookie': ['session_id=sessid1;'] } })
    postStub.onSecondCall().resolves({ data: { id: 'id1' } })
    postStub.onThirdCall().resolves()
    const loggerStub = { ...logger, info: sinon.spy() }
    const pushData = createPushData(postStub, loggerStub)

    await pushData('', { columns: '' })

    expect(loggerStub.info.getCall(loggerStub.info.getCalls().length - 1).args[0]).to.equal('Data push completed')
  })

  it('should send to post import/jobs options values from options argument', async () => {
    const postStub = sinon.stub()
    postStub.onFirstCall().resolves({ headers: { 'set-cookie': ['session_id=sessid1;'] } })
    postStub.onSecondCall().resolves({ data: { id: 'id1' } })
    postStub.onThirdCall().resolves()
    const pushData = createPushData(postStub)

    await pushData('', {
      columns: '',
      attributesUpdateMode: 'merge',
      removeUnmatchedMode: 'all'
    })

    expect(postStub.getCall(2).args[1].options).to.eql({
      attributesUpdateMode: 'merge',
      removeUnmatchedMode: 'all'
    })
  })

  it('should call overrideJson with data and options', async () => {
    const options = {}
    const data = ''

    const overrideJson = sinon.stub().returns('')

    const postStub = sinon.stub()
    postStub.onFirstCall().resolves({ headers: { 'set-cookie': ['session_id=sessid1;'] } })
    postStub.onSecondCall().resolves({ data: { id: 'id1' } })
    postStub.onThirdCall().resolves()
    const pushData = createPushData(postStub, undefined, overrideJson)

    await pushData(data, options)

    expect(overrideJson.getCalls()).to.have.lengthOf(1)
    expect(overrideJson.getCall(0).args[0]).to.equal(data)
    expect(overrideJson.getCall(0).args[1]).to.equal(options)
  })
})
