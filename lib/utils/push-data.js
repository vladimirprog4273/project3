const FormData = require('form-data')

module.exports = ({ axios, overrideJson, logger }) => async (data, options) => {
  logger.info('Starting data push')

  logger.debug('Authenticating on API')

  let res

  try {
    res = await axios.post(`${options.siteUri}/auth/login`, {
      email: options.siteEmail,
      password: options.sitePassword
    })
  } catch (e) {
    if (e.response && [422, 401].includes(e.response.status)) {
      throw new Error('Error on authentication: incorrect email/password')
    } else {
      throw e
    }
  }

  if (!('set-cookie' in res.headers)) {
    throw new Error("Error on authentication: 'set-cookie' doesn't exists in headers")
  }

  const found = res.headers['set-cookie'][0].match(/session_id=(\S*);/)

  if (!found) {
    throw new Error("Error on authentication: 'set-cookie' doesn't contain session_id")
  }

  const [, sessionId] = found

  logger.info('Authentication completed')

  const form = new FormData()

  form.append('file', overrideJson(data, options), 'import.csv')

  const cookie = `session_id=${sessionId};`
  const headers = { Cookie: cookie }

  logger.info('Uploading file')

  res = await axios.post(`${options.siteUri}/intgs/import/files`, form, {
    headers: { ...form.getHeaders(), ...headers },
    withCredentials: true
  })

  logger.info('File uploaded')

  logger.info('Creating import job')

  try {
    await axios.post(`${options.siteUri}/intgs/import/jobs`, {
      fileId: res.data.id,
      resource: options.resource,
      columns: options.columns,
      options: {
        attributesUpdateMode: options.attributesUpdateMode,
        removeUnmatchedMode: options.removeUnmatchedMode
      }
    }, {
      headers,
      withCredentials: true
    })
  } catch (err) {
    if (err.response) {
      logger.error({ err: err.response.data }, 'Error creating import job')
    }
    throw err
  }

  logger.info('Import job created')

  logger.info('Data push completed')
}
