import { TransactionOutput } from '../src/lib/transaction-output'

describe('TransactionOutput tests', () => {
  function createTransaction(amount = 100): TransactionOutput {
    return new TransactionOutput({
      toAddress: 'mock-address',
      amount,
    })
  }

  it('should not throw an error while validating transaction output', () => {
    const txOutput = createTransaction()

    expect(() => txOutput.validate()).not.toThrow()
  })

  it('should return transaction output data', () => {
    const txOutput = createTransaction()

    expect(txOutput.getToAddress()).toBe('mock-address')
    expect(txOutput.getAmount()).toBe(100)
    expect(txOutput.getTxHash()).toBe('')
  })

  it('should be able to set transaction output hash', () => {
    const txOutput = createTransaction()

    txOutput.setTxHash('mock-hash')

    expect(txOutput.getTxHash()).toBe('mock-hash')
  })

  it('should generate transaction output hash', () => {
    const txOutput = createTransaction()

    expect(txOutput.generateHash()).toBe(
      'e1a37031d45054eb64385e9bd032f7e61d8079db56e49a218e134de0da8cf4ed',
    )
  })

  it('should throw validation error if amount lower than 1', () => {
    const txOutput = createTransaction(0)

    expect(() => txOutput.validate()).toThrow(
      'Invalid transaction output amount',
    )
  })
})
