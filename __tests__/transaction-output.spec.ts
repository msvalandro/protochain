import { TransactionOutput } from '../src/lib/transaction-output'

describe('TransactionOutput tests', () => {
  function createTransaction(): TransactionOutput {
    return new TransactionOutput({
      toAddress: 'mock-address',
      amount: 100,
      txHash: 'mock-hash',
    })
  }

  it('should not throw an error while validating transaction', () => {
    const txOutput = createTransaction()

    expect(() => txOutput.validate()).not.toThrow()
  })
})
