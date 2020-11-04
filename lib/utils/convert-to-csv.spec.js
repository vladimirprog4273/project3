const { expect } = require('chai')
const convertToCSV = require('./convert-to-csv')

const NON_ARRAY_VALUES = [
  null,
  undefined,
  '',
  'foobar',
  {},
  [null]
]

describe('convertToCSV', () => {
  NON_ARRAY_VALUES.forEach(value => {
    it(`should fail if data is not an array: ${JSON.stringify(value)}`, async () => {
      try {
        await convertToCSV(value, [])
      } catch (err) {
        return
      }
      expect.fail('convertToCSV didn\'t fail as expected')
    })
  })

  NON_ARRAY_VALUES.forEach(value => {
    it(`should fail if columns is not an array: ${JSON.stringify(value)}`, async () => {
      try {
        await convertToCSV([{}, {}, {}], value)
      } catch (err) {
        return
      }
      expect.fail('convertToCSV didn\'t fail as expected')
    })
  })

  it('should return defined single column name, matching lines count, no values defined', async () => {
    const data = [{}, {}, {}]
    const columns = ['name']
    const result = await convertToCSV(data, columns)
    expect(result).equal('name\n\n\n\n')
  })

  it('should return defined column names, matching rows count, no values defined', async () => {
    const data = [{}, {}, {}]
    const columns = ['name', 'email']
    const result = await convertToCSV(data, columns)
    expect(result).equal('name,email\n,\n,\n,\n')
  })

  it('should return defined column names, values for defined properties', async () => {
    const data = [{ name: 'John' }, { email: 'mary@acme.com' }, {}]
    const columns = ['name', 'email']
    const result = await convertToCSV(data, columns)
    expect(result).equal('name,email\nJohn,\n,mary@acme.com\n,\n')
  })

  it('should return quoted string derived from an array if some field contains one', async () => {
    const data = [
      { otherTelephone: ['111', '222'] },
      { url: ['http://acme.com/profile111'] }
    ]
    const columns = ['otherTelephone', 'url']
    const result = await convertToCSV(data, columns)
    expect(result).equal('otherTelephone,url\n"[""111"",""222""]",\n,"[""http://acme.com/profile111""]"\n')
  })

  it('should return CSV with columns for all available fields if one of attributes is defined as an asterisk (*)', async () => {
    const data = [
      { displayName: 'Irene Adler' },
      { displayName: 'Mycroft Holmes', email: 'mycroft.holmes@acme.com' },
      { email: 'john.watson@acme.com', seatId: 'BST-221B' },
      { seatId: 'BST-222' },
      { objectId: '' }
    ]
    const columns = ['displayName', '*']
    const result = await convertToCSV(data, columns)
    expect(result).equal('displayName,email,seatId,objectId\nIrene Adler,,,\nMycroft Holmes,mycroft.holmes@acme.com,,\n,john.watson@acme.com,BST-221B,\n,,BST-222,\n,,,\n')
  })

  it('should return quoted column names and values if they contain quotes (") transformed into double-quotes (""), commas (,) or line breaks', async () => {
    const data = [
      {
        'Display Name': 'John-William Jr.',
        'Role & Job Title': 'Project manager for "ACME" project',
        Notes: 'Additional roles:\n\n* Project Manager\n* Team Manager',
        'Single-Quote': 'Don\'t mess',
        Tab: 'Start\tEnd'
      }
    ]
    const columns = ['Display Name', 'Role & Job Title', 'Notes', 'Single-Quote', 'Tab']
    const result = await convertToCSV(data, columns)
    expect(result).equal('Display Name,Role & Job Title,Notes,Single-Quote,Tab\nJohn-William Jr.,"Project manager for ""ACME"" project","Additional roles:\n\n* Project Manager\n* Team Manager",Don\'t mess,Start\tEnd\n')
  })
})
