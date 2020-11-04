const { expect } = require('chai')
const overrideJson = require('./override-json')

describe('Override json', () => {
  it('should override data in csv from overrideJson', () => {
    const inputCSV = 'a,b,c,d\n1,2,,\n3,4,,\n'

    const result = overrideJson(inputCSV, {
      overrideJson: { c: 3, d: 'asd' },
      attributes: ['c', 'd']
    })

    expect(result).to.eql('a,b,c,d\n1,2,3,asd\n3,4,3,asd\n')
  })

  it('should skip overrides if they not presents in attributes', () => {
    const inputCSV = 'a,b,c,d\n1,2,,\n3,4,,\n'

    const result = overrideJson(inputCSV, {
      overrideJson: { c: 3, d: 'asd' },
      attributes: ['d']
    })

    expect(result).to.eql('a,b,c,d\n1,2,,asd\n3,4,,asd\n')
  })

  it('should return not changed csv if no overrideJson in options', () => {
    const inputCSV = 'a,b,c,d\n1,2,,\n3,4,,\n'

    const result = overrideJson(inputCSV, {})

    expect(result).to.eql('a,b,c,d\n1,2,,\n3,4,,\n')
  })

  it('should return not changed csv if no columns correspond to overrideJson', () => {
    const inputCSV = 'a,b,c,d\n1,2,,\n3,4,,\n'

    const result = overrideJson(inputCSV, {
      overrideJson: { e: 3, f: 'asd' },
      attributes: ['e']
    })

    expect(result).to.eql('a,b,c,d\n1,2,,\n3,4,,\n')
  })
})
