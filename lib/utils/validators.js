const joi = require('joi')

module.exports = {
  ldapUriValidator: value => {
    const scheme = joi.string().label('url').uri({
      scheme: ['ldap', 'ldaps']
    })
    const { error } = scheme.validate(value)
    if (error) {
      throw error
    }
    return value
  },

  uriValidator: value => {
    const scheme = joi.string().label('url').uri({
      scheme: ['http', 'https']
    })
    const { error } = scheme.validate(value)
    if (error) {
      throw error
    }
    return value
  },

  jsonValidator: value => {
    return JSON.parse(value)
  }
}
