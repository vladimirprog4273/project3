const { expect } = require('chai')
const validators = require('./validators')

describe('validators', () => {
  describe('ldap uri', () => {
    const INVALID_URLS = [
      'foobar',
      'http://example.lan',
      'https://example.lan'
    ]
    INVALID_URLS.forEach(url => {
      it(`should invalidate invalid LDAP server URIs: ${JSON.stringify(url)}`, async () => {
        expect(() => validators.ldapUriValidator(url)).to.throw('"url" must be a valid uri with a scheme matching the ldap|ldaps pattern')
      })
    })

    const VALID_URLS = [
      'ldap://ldap.example.lan',
      'ldaps://ldap.example.lan',
      'ldap://10.0.1.12:636',
      'ldaps://10.0.1.12:636'
    ]
    VALID_URLS.forEach(url => {
      it(`should accept proper LDAP server URIs: ${JSON.stringify(url)}`, async () => {
        expect(() => validators.ldapUriValidator(url)).to.not.throw()
      })
    })
  })

  describe('uri', () => {
    const INVALID_URLS = [
      'foobar',
      'ldap://ldap.example.lan',
      'ldaps://10.0.1.12:636'
    ]
    INVALID_URLS.forEach(url => {
      it(`should invalidate invalid server URIs: ${JSON.stringify(url)}`, async () => {
        expect(() => validators.uriValidator(url)).to.throw('"url" must be a valid uri with a scheme matching the http|https pattern')
      })
    })

    const VALID_URLS = [
      'http://example.lan',
      'https://example.lan'
    ]
    VALID_URLS.forEach(url => {
      it(`should accept proper server URIs: ${JSON.stringify(url)}`, async () => {
        expect(() => validators.uriValidator(url)).to.not.throw()
      })
    })
  })

  describe('json', () => {
    const INVALID_OBJECTS = [
      'foobar',
      '{"a":1',
      '{b:2}'
    ]
    INVALID_OBJECTS.forEach(string => {
      it(`should invalidate invalid json strings: ${JSON.stringify(string)}`, async () => {
        expect(() => validators.jsonValidator(string)).to.throw()
      })
    })

    const VALID_OBJECTS = [
      ['{"c":3}', { c: 3 }],
      ['{"building":"Chicago","floor":3}', { building: 'Chicago', floor: 3 }]
    ]
    VALID_OBJECTS.forEach(([string, object]) => {
      it(`should accept proper string: ${string}`, async () => {
        expect(validators.jsonValidator(string)).to.eql(object)
      })
    })
  })
})
